package com.ecommerce.order.controller;

import com.ecommerce.order.dto.request.AddToCartRequest;
import com.ecommerce.order.dto.response.CartItemResponse;
import com.ecommerce.order.dto.response.CartResponse;
import com.ecommerce.order.security.UserPrincipal;
import com.ecommerce.order.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Cart", description = "Shopping cart management for customers")
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Add a product with quantity to the user's cart. Requires CUSTOMER role.")
    public ResponseEntity<CartItemResponse> addToCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddToCartRequest request) {
        CartItemResponse response = cartService.addToCart(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "View cart", description = "Retrieve all items currently in the user's cart. Requires CUSTOMER role.")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CartResponse cart = cartService.getCart(userPrincipal.getId());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart", description = "Remove a specific item from the cart by its ID. Requires CUSTOMER role.")
    public ResponseEntity<Void> removeFromCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        cartService.removeFromCart(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
