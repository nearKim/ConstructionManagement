from django.contrib import admin

from managements.models import *

admin.site.register(Project)
admin.site.register(Activity)
admin.site.register(Resource)
admin.site.register(WorkPackage)