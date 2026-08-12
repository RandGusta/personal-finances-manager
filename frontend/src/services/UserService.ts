import type { LoginRequest, LoginResponse } from "../dto/LoginRequest";
import type {
    ChangePasswordRequest,
    MessageResponse,
} from "../dto/PasswordRecovery";
import type { SignUpResponse, SingUpRequest } from "../dto/SingUpRequest";
import { getErrorMessage, getStoredToken } from "./api";

const API_BASE_URL = "http://localhost:8081";

export async function login(
    request: LoginRequest,
    rememberMe: boolean
): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`,{
        method: "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
            request
        )
    });

    if(!response.ok){
        const message = await getErrorMessage(response, "Email or password is incorrect");
        throw new Error(message);
    }

    const data = await response.json() as LoginResponse;
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", data.accessToken);

    return data;
}


export async function signUp(request: SingUpRequest): Promise<SignUpResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method:  "POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(request)
    });

    if(!response.ok){
        const message = await getErrorMessage(response, "Error trying to register");
        throw new Error(message);
    }

    return await response.json() as SignUpResponse;
}

export async function changePassword(
    request: ChangePasswordRequest,
): Promise<MessageResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("You need to sign in to change your password");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me/password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const message = await getErrorMessage(
            response,
            "Error while changing the password",
        );
        throw new Error(message);
    }

    return await response.json() as MessageResponse;
}

export async function getCurrentUserInform() {

    const token = getStoredToken();

    const response = await fetch("http://localhost:8081/home", {
        method: "GET",
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        }
        }
    );

    if(!response.ok){
        const error = await response.json();
        throw new Error(error["message"]);
    }

    return await response.json()

}
