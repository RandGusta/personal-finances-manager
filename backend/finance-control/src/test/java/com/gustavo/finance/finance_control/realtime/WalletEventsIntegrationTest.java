package com.gustavo.finance.finance_control.realtime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.annotation.DirtiesContext;

import com.gustavo.finance.finance_control.dto.CategoryRequest;
import com.gustavo.finance.finance_control.dto.WalletMemberRequest;
import com.gustavo.finance.finance_control.dto.WalletRequest;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.enums.UserType;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.security.JwtService;
import com.gustavo.finance.finance_control.security.UserSessionsRevokedEvent;
import com.gustavo.finance.finance_control.service.CategoryService;
import com.gustavo.finance.finance_control.service.EmailSenderService;
import com.gustavo.finance.finance_control.service.GeminiInsightClient;
import com.gustavo.finance.finance_control.service.WalletMemberService;
import com.gustavo.finance.finance_control.service.WalletService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.config.import=",
    "spring.datasource.url=jdbc:h2:mem:sse;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,TRANSACTION",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=VGhpc0lzQVRlc3RPbmx5U2VjcmV0S2V5Rm9yTG9jYWxBdWRpdA==",
    "app.frontend-url=http://localhost:5173",
    "app.ai.gemini.api-key=",
    "server.shutdown=immediate",
    "logging.level.root=ERROR"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WalletEventsIntegrationTest {

    private static final String TEST_SECRET =
        "VGhpc0lzQVRlc3RPbmx5U2VjcmV0S2V5Rm9yTG9jYWxBdWRpdA==";
    private static final String PASSWORD = "SseTest!12345";
    private static final String EVENTS_PATH = "/api/v1/users/me/events";

    @LocalServerPort private int port;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private WalletService wallets;
    @Autowired private WalletMemberService members;
    @Autowired private CategoryService categories;
    @Autowired private WalletEventService events;
    @MockitoBean private EmailSenderService emailSender;
    @MockitoBean private GeminiInsightClient gemini;

    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();
    private final List<User> testUsers = new ArrayList<>();

    @AfterEach
    void closeTestStreams() {
        for (User user : testUsers) {
            events.revokeUserSessions(new UserSessionsRevokedEvent(user.getId()));
        }
    }

    @Test
    void shouldRequireJwtAndRejectUnexpectedOrigins() throws Exception {
        assertEquals(401, call("GET", EVENTS_PATH, null, null).statusCode());
        assertEquals(401, call("GET", EVENTS_PATH, "invalid-token", null).statusCode());

        User user = createUser();
        HttpRequest request = request(EVENTS_PATH)
            .header("Authorization", "Bearer " + jwtService.generateToken(user))
            .header("Origin", "https://untrusted.example")
            .GET().build();
        assertEquals(403, client.send(request, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest preflight = request(EVENTS_PATH)
            .header("Origin", "http://localhost:5173")
            .header("Access-Control-Request-Method", "GET")
            .header("Access-Control-Request-Headers", "authorization")
            .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
        HttpResponse<String> allowed = client.send(preflight, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, allowed.statusCode());
        assertEquals("http://localhost:5173", allowed.headers()
            .firstValue("Access-Control-Allow-Origin").orElseThrow());
    }

    @Test
    void shouldNotifyMembersAfterCommittedCrudAndNotNotifyOutsidersOrRemovedMembers() throws Exception {
        User owner = createUser();
        User viewer = createUser();
        User outsider = createUser();
        WalletRequest walletRequest = new WalletRequest();
        walletRequest.setName("SSE shared wallet");
        Long walletId = wallets.create(owner, walletRequest).getId();
        WalletMemberRequest memberRequest = new WalletMemberRequest();
        memberRequest.setEmail(viewer.getEmail());
        memberRequest.setRole(UserRelationWallet.VIEWER);
        members.add(owner, walletId, memberRequest);

        CategoryRequest categoryRequest = new CategoryRequest();
        categoryRequest.setName("SSE food");
        categoryRequest.setType(TransactionType.EXPENSE);
        Long categoryId = categories.create(owner, categoryRequest).getId();
        String path = "/api/v1/wallets/" + walletId + "/transactions";
        Map<String, Object> body = Map.of("type", "EXPENSE", "amount", 25,
            "date", LocalDate.now().toString(), "categoryId", categoryId);
        String ownerToken = jwtService.generateToken(owner);

        try (SseConnection firstTab = connect(ownerToken);
             SseConnection secondTab = connect(ownerToken);
             SseConnection viewerConnection = connect(jwtService.generateToken(viewer));
             SseConnection outsiderConnection = connect(jwtService.generateToken(outsider))) {
            HttpResponse<String> created = call("POST", path, ownerToken, body);
            assertEquals(201, created.statusCode(), created.body());
            Long transactionId = json.readTree(created.body()).path("id").asLong();
            assertUpdate(firstTab, walletId, "CREATED");
            assertUpdate(secondTab, walletId, "CREATED");
            assertUpdate(viewerConnection, walletId, "CREATED");
            assertNull(outsiderConnection.nextMessage(250));

            HttpResponse<String> updated = call("PUT", path + "/" + transactionId, ownerToken, body);
            assertEquals(200, updated.statusCode(), updated.body());
            assertUpdate(firstTab, walletId, "UPDATED");
            assertUpdate(secondTab, walletId, "UPDATED");
            assertUpdate(viewerConnection, walletId, "UPDATED");

            assertEquals(403, call("DELETE", path + "/" + transactionId,
                jwtService.generateToken(viewer), null).statusCode());
            assertNull(firstTab.nextMessage(250));

            members.remove(owner, walletId, viewer.getId());
            assertEquals(204, call("DELETE", path + "/" + transactionId, ownerToken, null).statusCode());
            assertUpdate(firstTab, walletId, "DELETED");
            assertUpdate(secondTab, walletId, "DELETED");
            assertNull(viewerConnection.nextMessage(250));
            assertNull(outsiderConnection.nextMessage(250));
        }
    }

    @Test
    void shouldCloseStreamAfterPasswordChangeAndRejectOldToken() throws Exception {
        User user = createUser();
        String token = jwtService.generateToken(user);
        try (SseConnection connection = connect(token)) {
            HttpResponse<String> response = call("PATCH", "/api/v1/users/me/password", token,
                Map.of("currentPassword", PASSWORD, "newPassword", "NewSsePassword!12345"));
            assertEquals(200, response.statusCode(), response.body());
            assertEquals("closed", connection.nextMessage(5000));
            assertEquals(401, call("GET", EVENTS_PATH, token, null).statusCode());
        }
    }

    @Test
    void shouldCheckPersistedTokenVersionBeforeDeliveringEvents() throws Exception {
        User user = createUser();
        String token = jwtService.generateToken(user);
        try (SseConnection connection = connect(token)) {
            user.setTokenVersion(user.getTokenVersion() + 1);
            users.saveAndFlush(user);
            events.sendToUser(user.getId(), new WalletUpdateResponse(99L, TransactionChangeType.CREATED));
            assertEquals("closed", connection.nextMessage(5000));
            assertEquals(401, call("GET", EVENTS_PATH, token, null).statusCode());
        }
    }

    @Test
    void shouldCloseExpiredStreamsWithoutDeliveringUpdates() throws Exception {
        User user = createUser();
        String token = Jwts.builder().subject(user.getId().toString())
            .claim("email", user.getEmail()).claim("version", user.getTokenVersion())
            .expiration(new Date(System.currentTimeMillis() + 2500))
            .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET))).compact();
        try (SseConnection connection = connect(token)) {
            Thread.sleep(2600);
            events.sendToUser(user.getId(), new WalletUpdateResponse(99L, TransactionChangeType.CREATED));
            assertEquals("closed", connection.nextMessage(5000));
            assertEquals(401, call("GET", EVENTS_PATH, token, null).statusCode());
        }
    }

    @Test
    void shouldSendHeartbeatsWithoutSendingFinancialData() throws Exception {
        try (SseConnection connection = connect(jwtService.generateToken(createUser()))) {
            events.sendHeartbeats();
            assertEquals("heartbeat:keep-alive", connection.messages.poll(5, TimeUnit.SECONDS));
        }
    }

    private User createUser() {
        User user = new User();
        user.setUsername("SSE Test");
        user.setEmail(UUID.randomUUID() + "@sse.invalid");
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setUserType(UserType.USER);
        User saved = users.saveAndFlush(user);
        testUsers.add(saved);
        return saved;
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .timeout(Duration.ofSeconds(10));
    }

    private HttpResponse<String> call(String method, String path, String token, Object body) throws Exception {
        HttpRequest.Builder builder = request(path);
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        if (body != null) {
            builder.header("Content-Type", "application/json");
            builder.method(method, HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private SseConnection connect(String token) throws Exception {
        HttpRequest request = request(EVENTS_PATH)
            .header("Authorization", "Bearer " + token)
            .header("Accept", "text/event-stream")
            .header("Origin", "http://localhost:5173").GET().build();
        HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
        assertEquals(200, response.statusCode());
        assertTrue(response.headers().firstValue("Content-Type").orElseThrow().startsWith("text/event-stream"));
        assertEquals("no-store", response.headers().firstValue("Cache-Control").orElseThrow());
        SseConnection connection = new SseConnection(response.body());
        assertEquals("connected:ready", connection.nextMessage(5000));
        return connection;
    }

    private void assertUpdate(SseConnection connection, Long walletId, String type) throws Exception {
        String message = connection.nextMessage(5000);
        assertNotNull(message);
        assertTrue(message.startsWith("wallet-update:"), message);
        JsonNode data = json.readTree(message.substring("wallet-update:".length()));
        assertEquals(2, data.size());
        assertEquals(walletId.longValue(), data.path("walletId").asLong());
        assertEquals(type, data.path("changeType").asText());
        assertFalse(message.contains("email"));
        assertFalse(message.contains("token"));
    }

    private static class SseConnection implements AutoCloseable {
        private final InputStream input;
        private final BlockingQueue<String> messages = new LinkedBlockingQueue<>();

        SseConnection(InputStream input) {
            this.input = input;
            Thread reader = new Thread(() -> readEvents(), "sse-test-reader");
            reader.setDaemon(true);
            reader.start();
        }

        String nextMessage(long timeoutMillis) throws InterruptedException {
            long deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(timeoutMillis);
            while (true) {
                long remaining = deadline - System.nanoTime();
                if (remaining <= 0) {
                    return null;
                }
                String message = messages.poll(remaining, TimeUnit.NANOSECONDS);
                if (message == null || !message.startsWith("heartbeat:")) {
                    return message;
                }
            }
        }

        private void readEvents() {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
                String event = "message";
                StringBuilder data = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("event:")) {
                        event = line.substring(6).stripLeading();
                    } else if (line.startsWith("data:")) {
                        data.append(line.substring(5).stripLeading());
                    } else if (line.isEmpty() && !data.isEmpty()) {
                        messages.add(event + ":" + data);
                        event = "message";
                        data.setLength(0);
                    }
                }
            } catch (Exception exception) {
                // O teste também fecha o InputStream ao concluir cada cenário.
            } finally {
                messages.add("closed");
            }
        }

        @Override
        public void close() throws Exception {
            input.close();
        }
    }
}
