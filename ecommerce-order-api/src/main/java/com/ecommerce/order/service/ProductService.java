package com.ecommerce.order.service;

import com.ecommerce.order.dto.request.ProductRequest;
import com.ecommerce.order.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductResponse> getProducts(Long categoryId, Pageable pageable);
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
