package com.gustavo.finance.finance_control.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.CategoryRequest;
import com.gustavo.finance.finance_control.dto.CategoryResponse;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> list(Authentication authentication, @RequestParam(required = false) TransactionType type) {
        return ResponseEntity.ok(categoryService.list(authenticatedUser(authentication), type));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
        Authentication authentication, @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.create(authenticatedUser(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
        Authentication authentication,
        @PathVariable Long id,
        @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(
            categoryService.update(authenticatedUser(authentication), id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        categoryService.delete(authenticatedUser(authentication), id);
        return ResponseEntity.noContent().build();
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
