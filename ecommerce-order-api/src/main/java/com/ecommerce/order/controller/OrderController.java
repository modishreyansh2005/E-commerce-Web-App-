package com.ecommerce.order.controller;

import com.ecommerce.order.dto.response.OrderResponse;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.entity.Role;
import com.ecommerce.order.security.UserPrincipal;
import com.ecommerce.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Orders", description = "Order placement, order history, and lifecycle management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Place order from cart", description = "Converts user cart into an order in PLACED status. Checks stock, snapshots prices, and atomically decrements inventory.")
    public ResponseEntity<OrderResponse> placeOrder(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        OrderResponse orderResponse = orderService.placeOrderFromCart(userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(orderResponse);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get my orders", description = "Retrieve paginated order history for the authenticated customer. Default sort: createdAt DESC.")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getMyOrders(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders", description = "Retrieve all orders in the system, optionally filtered by status (PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED). Requires ADMIN role.")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> orders = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get order by ID", description = "Retrieve details and items of a specific order. Customers can view only their own orders; Admins can view any.")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        boolean isAdmin = userPrincipal.getRole() == Role.ADMIN;
        OrderResponse order = orderService.getOrderById(id, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status", description = "Execute state machine transition on order. Action can be: confirm, ship, deliver, cancel. Restocks products if cancelled. Requires ADMIN role.")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String action) {
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, action);
        return ResponseEntity.ok(updatedOrder);
    }
}
