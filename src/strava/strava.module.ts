import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';

import { StravaController } from './strava.controller';
import { StravaService } from './strava.service';

import { Activity, ActivitySchema } from './schemas/activity.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Activity.name, schema: ActivitySchema }], 'strava')],
    controllers: [StravaController],
    providers: [StravaService],
})
export class StravaModule {
    constructor(private configService: ConfigService) { }
}
