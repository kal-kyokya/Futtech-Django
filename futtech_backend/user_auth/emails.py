"""
Email helpers for user authentication lifecycle messages.
"""

import logging
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape

TEMPLATE_DIR = Path(__file__).resolve().parent / 'templates' / 'emails'

logger = logging.getLogger(__name__)

def _display_name(user):
    """
    Return the best available human-readable name for a user.
    """

    full_name = user.get_full_name().strip()
    return full_name or getattr(user, 'username', '') or getattr(user, 'email', '')


def _render_email_template(template_name, context):
    """
    Render this app's simple welcome templates with escaped values.
    """

    rendered = (TEMPLATE_DIR / template_name).read_text()
    for key, value in context.items():
        rendered = rendered.replace(
            '{{ ' + key + ' }}',
            escape(str(value)),
        )
    return rendered


def send_welcome_email(user):
    """
    Send Futtech's welcome email to a newly created user.

    Delivery failures are logged and swallowed so account creation remains
    successful when the configured email provider is temporarily unavailable.
    """

    recipient = getattr(user, 'email', '')
    if not recipient:
        logger.info('Skipping welcome email for user %s without email', user.pk)
        return False

    context = {
        'display_name': _display_name(user),
        'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5174'),
    }
    subject = 'Welcome to Futtech'
    text_body = _render_email_template('welcome_email.txt', context)
    html_body = _render_email_template('welcome_email.html', context)

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
        to=[recipient],
    )
    message.attach_alternative(html_body, 'text/html')

    try:
        message.send(fail_silently=False)
    except Exception:
        logger.exception('Failed to send welcome email to user %s.', user.pk)
        return False

    return True
