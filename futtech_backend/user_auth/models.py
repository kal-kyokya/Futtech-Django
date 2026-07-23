from django.conf import settings
from django.db import models


class SocialAccount(models.Model):
    """
    Stores the minimum provider identity needed to link social logins.
    """

    PROVIDER_GOOGLE = 'google'
    PROVIDER_CHOICES = ((PROVIDER_GOOGLE, 'Google'),)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='social_accounts',
    )
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES)
    provider_user_id = models.CharField(max_length=255)
    email = models.EmailField()
    name = models.CharField(max_length=255, blank=True, default='')
    picture_url = models.URLField(max_length=512, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['provider', 'provider_user_id'],
                name='unique_social_provider_user',
            ),
        ]
        indexes = [models.Index(fields=['provider', 'email'])]

    def __str__(self):
        return f'{self.provider}:{self.email}'
