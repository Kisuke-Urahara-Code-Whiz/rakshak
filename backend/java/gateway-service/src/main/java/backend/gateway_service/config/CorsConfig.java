package backend.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;

@Configuration
public class CorsConfig {

    private static final String ALLOWED_HEADERS = "*";
    private static final String ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH";
    private static final String ALLOWED_ORIGIN = "*";
    private static final String MAX_AGE = "3600";

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public WebFilter corsFilter() {
        return (ServerWebExchange ctx, WebFilterChain chain) -> {
            ServerHttpRequest request = ctx.getRequest();
            ServerHttpResponse response = ctx.getResponse();
            HttpHeaders headers = response.getHeaders();

            if (request.getMethod() == HttpMethod.OPTIONS) {
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN);
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, ALLOWED_METHODS);
                headers.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, MAX_AGE);
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, ALLOWED_HEADERS);
                response.setStatusCode(HttpStatus.OK);
                return Mono.empty();
            }

            response.beforeCommit(() -> {
                List<String> originList = headers.get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
                if (originList == null || originList.isEmpty()) {
                    headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN);
                } else if (originList.size() > 1) {
                    headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, originList.get(0));
                }
                return Mono.empty();
            });

            return chain.filter(ctx);
        };
    }
}
