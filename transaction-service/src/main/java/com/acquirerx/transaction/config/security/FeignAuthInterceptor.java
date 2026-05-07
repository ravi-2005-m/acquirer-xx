package com.acquirerx.transaction.config.security;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return;
        HttpServletRequest req = attrs.getRequest();
        forward(req, template, "X-User-Role");
        forward(req, template, "X-Username");
        forward(req, template, "X-User-Id");
    }

    private void forward(HttpServletRequest req, RequestTemplate template, String header) {
        String value = req.getHeader(header);
        if (value != null && !value.isBlank()) {
            template.header(header, value);
        }
    }
}
