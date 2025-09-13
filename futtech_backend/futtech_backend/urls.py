"""
URL configuration for futtech_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from video_management import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('stripe/',
         include('djstripe.urls',
                 namespace='djstripe')),
    path('api/videos/<uuid:video_id>/',
         views.get_video_data,
         name='get_video_data'),
    path('api/videos/<uuid:video_id>/get-playback-token/',
         views.get_playback_token,
         name='get_playback_token'),
    path('api/pricing-page-identifiers/',
         views.get_pricing_page_identifiers,
         name='get_pricing_page_identifiers'),
    path('subscription-confirm',
         views.get_subscription_confirmation,
         name='get_subscription_confirmation'),
]
