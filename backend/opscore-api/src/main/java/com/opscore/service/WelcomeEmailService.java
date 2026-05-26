package com.opscore.service;

import com.opscore.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the welcome email triggered by a successful
 * {@code UserService#createUser} call.
 *
 * <h2>Activation</h2>
 * <p>Delivery is <b>opt-in</b>. Two conditions must be met:
 * <ol>
 *   <li>{@code opscore.mail.enabled=true} (env var
 *       {@code OPSCORE_MAIL_ENABLED}). Default {@code false} — boots
 *       cleanly without SMTP.</li>
 *   <li>A {@link JavaMailSender} bean is present (auto-configured by
 *       {@code spring-boot-starter-mail} as soon as the dependency is
 *       on the classpath) AND {@code opscore.mail.from} is non-blank.</li>
 * </ol>
 *
 * <p>If the flag is on but the SMTP block is incomplete, the service
 * logs a WARN and skips the send <b>without</b> propagating the error.
 * If the send itself fails (transient SMTP outage, auth issue, etc.),
 * the exception is caught, logged at WARN and swallowed — user
 * creation must never depend on email reachability.
 *
 * <h2>SMTP configuration</h2>
 * <p>Set via env vars at deploy time:
 * <pre>{@code
 *   OPSCORE_MAIL_ENABLED=true
 *   SMTP_HOST=smtp.yourprovider.com
 *   SMTP_PORT=587
 *   SMTP_USERNAME=noreply@yourdomain.com
 *   SMTP_PASSWORD=...
 *   MAIL_FROM=noreply@yourdomain.com
 * }</pre>
 *
 * The application.properties block already maps these to the
 * {@code spring.mail.*} properties consumed by Spring's auto-config,
 * including STARTTLS defaults appropriate for ports 587/2525.
 *
 * <h2>Security notes</h2>
 * <ul>
 *   <li>The welcome message <b>never</b> embeds the user's password —
 *       credentials must reach the user through whichever out-of-band
 *       channel the administrator chooses.</li>
 *   <li>No personally identifiable data beyond the user's own name and
 *       email is included.</li>
 *   <li>The SMTP password is read from env, never logged.</li>
 * </ul>
 */
@Slf4j
@Service
public class WelcomeEmailService {

    private static final String SUBJECT = "Bienvenido a OpsCore";

    private final boolean enabled;
    private final String mailFrom;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public WelcomeEmailService(
            @Value("${opscore.mail.enabled:false}") boolean enabled,
            @Value("${opscore.mail.from:}") String mailFrom,
            ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.enabled = enabled;
        this.mailFrom = mailFrom;
        this.mailSenderProvider = mailSenderProvider;
    }

    /**
     * Best-effort welcome email. Never throws under normal use:
     * <ul>
     *   <li>missing user / email → silent no-op</li>
     *   <li>mail disabled → INFO log</li>
     *   <li>missing JavaMailSender or empty {@code mailFrom} → WARN log,
     *       no send</li>
     *   <li>SMTP failure → WARN log, exception is swallowed</li>
     * </ul>
     */
    public void sendWelcomeEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        String firstName = (user.getFirstName() != null && !user.getFirstName().isBlank())
                ? user.getFirstName()
                : null;
        String logName = firstName != null ? firstName : user.getEmail();

        if (!enabled) {
            log.info(
                    "[welcome-mail] (disabled) account created for {} <{}> — "
                            + "set OPSCORE_MAIL_ENABLED=true with SMTP_* env vars to deliver",
                    logName, user.getEmail());
            return;
        }

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn(
                    "[welcome-mail] OPSCORE_MAIL_ENABLED=true but no JavaMailSender "
                            + "bean is available — check spring-boot-starter-mail is on the "
                            + "classpath. Skipping send to {}.",
                    user.getEmail());
            return;
        }
        if (mailFrom == null || mailFrom.isBlank()) {
            log.warn(
                    "[welcome-mail] OPSCORE_MAIL_ENABLED=true but MAIL_FROM is not set. "
                            + "Skipping send to {}.",
                    user.getEmail());
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject(SUBJECT);
        message.setText(buildBody(firstName));

        try {
            sender.send(message);
            log.info("[welcome-mail] sent to {} <{}>", logName, user.getEmail());
        } catch (Exception ex) {
            // SMTP failures must never propagate — user creation already
            // succeeded by the time this method runs.
            log.warn(
                    "[welcome-mail] delivery failed for {}: {} ({})",
                    user.getEmail(), ex.getClass().getSimpleName(), ex.getMessage());
        }
    }

    /**
     * Builds the plain-text welcome body. No password, no link tokens,
     * no PII beyond the recipient's own first name. Falls back to a
     * generic greeting when the firstName is missing.
     */
    private String buildBody(String firstName) {
        String greeting = (firstName != null) ? "Hola " + firstName + "," : "Hola,";
        return greeting + "\n\n"
                + "Tu cuenta en OpsCore ha sido creada correctamente.\n\n"
                + "Ya puedes acceder a la plataforma con las credenciales "
                + "proporcionadas por tu administrador.\n\n"
                + "Por seguridad, te recomendamos cambiar tu contraseña "
                + "después del primer inicio de sesión.\n\n"
                + "Saludos,\n"
                + "Equipo OpsCore\n";
    }
}
