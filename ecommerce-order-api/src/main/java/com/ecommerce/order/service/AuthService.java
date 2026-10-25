package com.ecommerce.order.service;

import com.ecommerce.order.dto.request.LoginRequest;
import com.ecommerce.order.dto.request.RegisterRequest;
import com.ecommerce.order.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
