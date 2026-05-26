package com.opscore.service;

import com.opscore.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pure unit tests for {@link WelcomeEmailService}. The service is wired
 * manually with mocked dependencies — no Spring context is loaded.
 *
 * The five branches under test mirror the documented contract:
 * <ol>
 *   <li>disabled flag → log only, no send</li>
 *   <li>enabled + no sender → warn, no send</li>
 *   <li>enabled + no mailFrom → warn, no send</li>
 *   <li>happy path → JavaMailSender.send() invoked with the expected
 *       {@link SimpleMailMessage}</li>
 *   <li>send throws → exception swallowed (never propagated)</li>
 * </ol>
 */
class WelcomeEmailServiceTest {

    private static final String FROM = "noreply@opscore.test";

    private final User sampleUser = userOf("Ada", "ada@opscore.test");

    @Test
    void disabled_flag_does_not_invoke_sender() {
        JavaMailSender sender = mock(JavaMailSender.class);
        WelcomeEmailService service = new WelcomeEmailService(
                /* enabled = */ false,
                /* mailFrom = */ FROM,
                providerOf(sender)
        );

        service.sendWelcomeEmail(sampleUser);

        verify(sender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void enabled_without_sender_does_not_throw_and_does_not_send() {
        WelcomeEmailService service = new WelcomeEmailService(
                /* enabled = */ true,
                /* mailFrom = */ FROM,
                providerOf(null)
        );

        assertThatCode(() -> service.sendWelcomeEmail(sampleUser))
                .doesNotThrowAnyException();
    }

    @Test
    void enabled_without_mail_from_does_not_send() {
        JavaMailSender sender = mock(JavaMailSender.class);
        WelcomeEmailService service = new WelcomeEmailService(
                /* enabled = */ true,
                /* mailFrom = */ "   ", // blank
                providerOf(sender)
        );

        service.sendWelcomeEmail(sampleUser);

        verify(sender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void happy_path_sends_message_with_expected_envelope() {
        JavaMailSender sender = mock(JavaMailSender.class);
        WelcomeEmailService service = new WelcomeEmailService(
                /* enabled = */ true,
                /* mailFrom = */ FROM,
                providerOf(sender)
        );

        service.sendWelcomeEmail(sampleUser);

        org.mockito.ArgumentCaptor<SimpleMailMessage> captor =
                org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getFrom()).isEqualTo(FROM);
        assertThat(sent.getTo()).containsExactly("ada@opscore.test");
        assertThat(sent.getSubject()).isEqualTo("Bienvenido a OpsCore");
        assertThat(sent.getText())
                .as("body must greet by first name and must NOT include the password")
                .contains("Hola Ada")
                .doesNotContainIgnoringCase("password")
                .doesNotContainIgnoringCase("contraseña: ");
    }

    @Test
    void send_failure_is_swallowed() {
        JavaMailSender sender = mock(JavaMailSender.class);
        doThrow(new MailSendException("simulated SMTP outage"))
                .when(sender).send(any(SimpleMailMessage.class));

        WelcomeEmailService service = new WelcomeEmailService(
                /* enabled = */ true,
                /* mailFrom = */ FROM,
                providerOf(sender)
        );

        assertThatCode(() -> service.sendWelcomeEmail(sampleUser))
                .as("SMTP exceptions must never propagate to the caller")
                .doesNotThrowAnyException();
    }

    @Test
    void null_user_is_ignored_silently() {
        JavaMailSender sender = mock(JavaMailSender.class);
        WelcomeEmailService service = new WelcomeEmailService(true, FROM, providerOf(sender));

        service.sendWelcomeEmail(null);

        verify(sender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void user_without_email_is_ignored_silently() {
        JavaMailSender sender = mock(JavaMailSender.class);
        WelcomeEmailService service = new WelcomeEmailService(true, FROM, providerOf(sender));

        User noEmail = userOf("Lin", null);
        service.sendWelcomeEmail(noEmail);

        verify(sender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void user_without_first_name_uses_generic_greeting() {
        JavaMailSender sender = mock(JavaMailSender.class);
        WelcomeEmailService service = new WelcomeEmailService(true, FROM, providerOf(sender));

        User anon = userOf(null, "anon@opscore.test");
        service.sendWelcomeEmail(anon);

        org.mockito.ArgumentCaptor<SimpleMailMessage> captor =
                org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(captor.capture());
        assertThat(captor.getValue().getText())
                .as("falls back to 'Hola,' without doubling the word when firstName is missing")
                .startsWith("Hola,\n\n")
                .doesNotContain("Hola Hola");
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private static ObjectProvider<JavaMailSender> providerOf(JavaMailSender sender) {
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(sender);
        return provider;
    }

    private static User userOf(String firstName, String email) {
        User u = new User();
        u.setFirstName(firstName);
        u.setLastName("Lovelace");
        u.setEmail(email);
        return u;
    }
}
