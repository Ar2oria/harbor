// Copyright (c) 2017 VMware, Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { CookieService } from 'ngx-cookie';

import { AppConfig } from './app-config';
import { CookieKeyOfAdmiral, HarborQueryParamKey } from './shared/shared.const';
import { maintainUrlQueryParmas, HTTP_GET_OPTIONS} from './shared/shared.utils';

export const systemInfoEndpoint = "/api/systeminfo";
/**
 * Declare service to handle the bootstrap options
 *
 *
 * @export
 * @class GlobalSearchService
 */
@Injectable()
export class AppConfigService {

    // Store the application configuration
    configurations: AppConfig = new AppConfig();

    constructor(
        private http: Http,
        private cookie: CookieService) { }

    public load(): Promise<AppConfig> {
        return this.http.get(systemInfoEndpoint, HTTP_GET_OPTIONS).toPromise()
            .then(response => {
                this.configurations = response.json() as AppConfig;

                // Read admiral endpoint from cookie if existing
                let admiralUrlFromCookie: string = this.cookie.get(CookieKeyOfAdmiral);
                if (admiralUrlFromCookie) {
                    // Override the endpoint from configuration file
                    this.configurations.admiral_endpoint = decodeURIComponent(admiralUrlFromCookie);
                }

                return this.configurations;
            });
    }

    public getConfig(): AppConfig {
        return this.configurations;
    }

    public isIntegrationMode(): boolean {
        return this.configurations &&
            this.configurations.with_admiral &&
            this.configurations.admiral_endpoint.trim() !== "";
    }

    // Return the reconstructed admiral url
    public getAdmiralEndpoint(currentHref: string): string {
        let admiralUrl: string = this.configurations.admiral_endpoint;
        if (admiralUrl.trim() === "" || currentHref.trim() === "") {
            return "#";
        }

        return maintainUrlQueryParmas(admiralUrl, HarborQueryParamKey, encodeURIComponent(currentHref));
    }

    public saveAdmiralEndpoint(endpoint: string): void {
        if (!(endpoint.trim())) {
            return;
        }

        // Save back to cookie
        this.cookie.put(CookieKeyOfAdmiral, endpoint);
        this.configurations.admiral_endpoint = endpoint;
    }
}
