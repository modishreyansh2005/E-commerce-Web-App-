package com.ecommerce.order.service.impl;

import com.ecommerce.order.dto.request.AddToCartRequest;
import com.ecommerce.order.dto.response.CartItemResponse;
import com.ecommerce.order.dto.response.CartResponse;
import com.ecommerce.order.dto.response.CategoryResponse;
import com.ecommerce.order.dto.response.ProductResponse;
import com.ecommerce.order.entity.CartItem;
import com.ecommerce.order.entity.Category;
import com.ecommerce.order.entity.Product;
import com.ecommerce.order.entity.User;
import com.ecommerce.order.exception.BusinessException;
import com.ecommerce.order.exception.ResourceNotFoundException;
import com.ecommerce.order.repository.CartItemRepository;
import com.ecommerce.order.repository.ProductRepository;
import com.ecommerce.order.repository.UserRepository;
import com.ecommerce.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartItemResponse addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, product.getId());

        int totalRequestedQuantity = request.getQuantity();
        CartItem cartItem;

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            totalRequestedQuantity += cartItem.getQuantity();
            if (totalRequestedQuantity > product.getStockQuantity()) {
                throw new BusinessException(String.format(
                        "Cannot add %d items. You already have %d in cart, but only %d in stock for '%s'.",
                        request.getQuantity(), cartItem.getQuantity(), product.getStockQuantity(), product.getName()));
            }
            cartItem.setQuantity(totalRequestedQuantity);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new BusinessException(String.format(
                        "Insufficient stock for '%s'. Requested: %d, Available: %d",
                        product.getName(), request.getQuantity(), product.getStockQuantity()));
            }
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(savedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);

        List<CartItemResponse> itemResponses = items.stream()
                .map(this::mapToCartItemResponse)
                .toList();

        BigDecimal totalAmount = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalQuantity = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .items(itemResponses)
                .totalQuantity(totalQuantity)
                .totalAmount(totalAmount)
                .build();
    }

    @Override
    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        Category category = product.getCategory();
        CategoryResponse categoryResponse = null;
        if (category != null) {
            categoryResponse = CategoryResponse.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .description(category.getDescription())
                    .build();
        }

        ProductResponse productResponse = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(categoryResponse)
                .createdAt(product.getCreatedAt())
                .build();

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .product(productResponse)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
