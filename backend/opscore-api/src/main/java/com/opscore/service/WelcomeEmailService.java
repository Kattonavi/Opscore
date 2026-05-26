package com.opscore.service;

import com.opscore.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Sends the welcome email triggered by a successful
 * {@code UserService#createUser} call.
 *
 * <h2>Current behaviour</h2>
 * <p>The project does <b>not</b> include
 * {@code spring-boot-starter-mail} yet, so this service intentionally
 * runs in <em>log-only</em> mode: the welcome event is recorded in the
 * application log at INFO level, but no email is actually sent. This
 * keeps the user-creation flow functional in every environment without
 * forcing an SMTP setup.
 *
 * <h2>Enabling real email delivery</h2>
 * <p>When the infrastructure team is ready to deliver real email, the
 * minimal steps are:
 * <ol>
 *   <li>Add the dependency to {@code backend/opscore-api/pom.xml}:
 *       <pre>{@code
 *  <dependency>
 *      <groupId>org.springframework.boot</groupId>
 *      <artifactId>spring-boot-starter-mail</artifactId>
 *  </dependency>
 *       }</pre>
 *   </li>
 *   <li>Configure SMTP in {@code application.properties} (values from env):
 *       <pre>{@code
 *  spring.mail.host=${SMTP_HOST}
 *  spring.mail.port=${SMTP_PORT:587}
 *  spring.mail.username=${SMTP_USERNAME}
 *  spring.mail.password=${SMTP_PASSWORD}
 *  spring.mail.properties.mail.smtp.auth=true
 *  spring.mail.properties.mail.smtp.starttls.enable=true
 *  opscore.mail.from=${MAIL_FROM}
 *  opscore.mail.enabled=true
 *       }</pre>
 *   </li>
 *   <li>Inject {@code JavaMailSender} into this class and replace
 *       {@link #sendWelcomeEmail(User)} with a real send. Keep the
 *       try/catch in {@code UserService#createUser} so a transient SMTP
 *       failure never blocks account creation.</li>
 * </ol>
 *
 * <h2>Security notes</h2>
 * <p>The current implementation never logs the user password. When a
 * real SMTP integration replaces this stub, the welcome message MUST NOT
 * embed the password either — the recipient already received it through
 * the channel chosen by the administrator who created the account.
 */
@Slf4j
@Service
public class WelcomeEmailService {

    private final boolean enabled;
    private final String mailFrom;

    public WelcomeEmailService(
            @Value("${opscore.mail.enabled:false}") boolean enabled,
            @Value("${opscore.mail.from:}") String mailFrom) {
        this.enabled = enabled;
        this.mailFrom = mailFrom;
    }

    /**
     * Best-effort welcome email. Never throws; logs the outcome instead.
     * The caller is expected to wrap this in a try/catch as a defensive
     * measure against future implementations that may legitimately throw.
     */
    public void sendWelcomeEmail(User user) {
        if (user == null || user.getEmail() == null) {
            return;
        }
        String displayName = user.getFirstName() != null
                ? user.getFirstName()
                : user.getEmail();

        if (!enabled) {
            log.info(
                    "[welcome-mail] (no-op) account created for {} <{}> — "
                            + "enable spring-boot-starter-mail + set "
                            + "opscore.mail.enabled=true to deliver",
                    displayName, user.getEmail());
            return;
        }

        // Real SMTP delivery placeholder. When the dependency is added,
        // wire JavaMailSender here. We intentionally do NOT swallow the
        // build error of a missing JavaMailSender so the deployer notices
        // the missing piece.
        log.warn(
                "[welcome-mail] enabled flag is true but JavaMailSender "
                        + "is not wired yet (from={}, to={}). See class javadoc.",
                mailFrom, user.getEmail());
    }
}
