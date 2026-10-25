package com.ecommerce.order.service;

import com.ecommerce.order.dto.request.AddToCartRequest;
import com.ecommerce.order.dto.response.CartItemResponse;
import com.ecommerce.order.dto.response.CartResponse;

public interface CartService {
    CartItemResponse addToCart(Long userId, AddToCartRequest request);
    CartResponse getCart(Long userId);
    void removeFromCart(Long userId, Long cartItemId);
    void clearCart(Long userId);
}
