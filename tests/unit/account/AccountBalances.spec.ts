/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {describe, test, expect} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {
    SAMPLE_ASSOCIATED_TOKEN, SAMPLE_ASSOCIATED_TOKEN_2,
    SAMPLE_TOKEN_ASSOCIATIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import AccountBalances from "@/pages/AccountBalances.vue";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("AccountBalances.vue", () => {

    test("all props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);
        const accountId = "0.0.935559"
        const matcher1 = `/api/v1/accounts/${accountId}/tokens`
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_ASSOCIATIONS)

        const token1 = SAMPLE_ASSOCIATED_TOKEN.token_id
        const token2 = SAMPLE_ASSOCIATED_TOKEN_2.token_id
        const matcher2 = "/api/v1/tokens/"
        mock.onGet(matcher2 + token1).reply(200, SAMPLE_ASSOCIATED_TOKEN)
        mock.onGet(matcher2 + token2).reply(200, SAMPLE_ASSOCIATED_TOKEN_2)

        const wrapper = mount(AccountBalances, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: accountId
            },
        });

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("Token Balance")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.34332104" + "HSuite" + "0.0000" +
            "0.0.49292859" + "TokenA7" + "0.00000000")

        wrapper.unmount()
        await flushPromises()
    });

});
