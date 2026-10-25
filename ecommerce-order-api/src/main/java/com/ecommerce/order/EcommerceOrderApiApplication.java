package com.ecommerce.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class EcommerceOrderApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceOrderApiApplication.class, args);
    }
}
