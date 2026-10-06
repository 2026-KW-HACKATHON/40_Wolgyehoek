package com.wolgyehoek.dongnae.device;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Component
public class DeviceCookieFilter extends OncePerRequestFilter {

    public static final String COOKIE_NAME = "dn_device";
    public static final String ATTRIBUTE_NAME = "deviceId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String deviceId = readDeviceId(request);

        if(deviceId == null) {
            deviceId = newDeviceId();
            ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, deviceId)
                    .httpOnly(true)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(365))
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        request.setAttribute(ATTRIBUTE_NAME, deviceId);
        filterChain.doFilter(request, response);
    }

    private String readDeviceId(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if(cookies == null) {
            return null;
        }
        for(Cookie cookie : cookies) {
            if(COOKIE_NAME.equals(cookie.getName()) && isValid(cookie.getValue())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private boolean isValid(String value) {
        return value != null && value.matches("d_[0-9a-f]{16}");
    }

    private String newDeviceId() {
        return "d_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
