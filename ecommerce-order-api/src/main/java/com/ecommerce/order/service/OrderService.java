package com.ecommerce.order.service;

import com.ecommerce.order.dto.response.OrderResponse;
import com.ecommerce.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse placeOrderFromCart(Long userId);
    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);
    Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);
    OrderResponse getOrderById(Long orderId, Long requestingUserId, boolean isAdmin);
    OrderResponse updateOrderStatus(Long orderId, String action);
}
