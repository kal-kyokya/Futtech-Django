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


###
# Uses a 'top-level' hierarchical routing approach where URL requests are
# directed to 'installed apps' for further processing.
#
# Keeping the project's routing clean and scalable as more applications
# as well as endpoints are added.
###

urlpatterns = [
    path('admin/', admin.site.urls),
    path('stripe/', include(
        'djstripe.urls',
        namespace='djstripe'
    )),
    path('/api/v2/auth/', include(
        'user_auth.urls',
        namespace='user-auth'
    )),
    path('api/v2/', include(
        'video_management.urls',
        namespace='video-management'
    )),
    path('api/v2/playlists/', include(
        'playlists.urls',
        namespace='playlists'
    )),
]
