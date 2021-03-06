import { Injectable, Logger } from '@nestjs/common';
import { BulkWriteOpResultObject } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Route, RouteDocument } from './schemas/route.schema';
import { Workout, WorkoutDocument } from './schemas/workout.schema';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import axios from 'axios';

const BASE_URL = "https://api.ua.com";
const instance = axios.create({ baseURL: BASE_URL });
@Injectable()
export class UnderArmourService {
    constructor(
        @InjectModel(Route.name) private activityModel: Model<RouteDocument>,
        @InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>,
        private configService: ConfigService
    ) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${configService.get("APP__UNDERARMOUR_ACCESS_TOKEN")}`;
    }

    getHeartBeat(): string {
        return "Beat!";
    }

    async getRoutes(): Promise<any[]> {
        const { id } = (await instance.get('v7.1/user/self')).data;

        let data = (await instance.get(`v7.1/route/?user=${id}&limit=40`)).data;
        let result = data['_embedded']['routes'];

        while ('next' in data['_links']) {
            const nextLink = data['_links']['next'][0]['href'];
            data = (await instance.get(nextLink)).data
            result = result.concat(data['_embedded']['routes']);
        }
        return Promise.resolve(result);
    }

    async getWorkouts(): Promise<any[]> {
        const { id } = (await instance.get('v7.1/user/self')).data;

        let data = (await instance.get(`v7.1/workout/?user=${id}&limit=40`)).data;
        let result = data['_embedded']['workouts'];

        while ('next' in data['_links']) {
            const nextLink = data['_links']['next'][0]['href'];
            data = (await instance.get(nextLink)).data
            result = result.concat(data['_embedded']['workouts']);
        }
        return Promise.resolve(result);
    }

    async upsertRoutes(routes: any[]) {
        const bulkWriteActivities = routes.map(route => ({
            updateOne: {
                filter: { id: route._links.self[0].id },
                update: { ...route },
                upsert: true
            }
        }));
        const res = this.activityModel.bulkWrite(bulkWriteActivities);
        return res;
    }

    upsertWorkouts(workouts: any[]) {
        const bulkWriteActivities = workouts.map(workout => ({
            updateOne: {
                filter: { id: workout._links.self[0].id },
                update: { ...workout },
                upsert: true
            }
        }));
        const res = this.workoutModel.bulkWrite(bulkWriteActivities);
        return res;
    }
}
