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

import {describe, it, expect} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import BlobValue from "@/components/values/BlobValue.vue";

describe("BlobValue.vue", () => {

    //
    // blobValue undefined
    //

    it("blobValue undefined, showNone == false", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
        await flushPromises()
    })

    it("blobValue undefined, showNone == true", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                showNone: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe("None")

        wrapper.unmount()
        await flushPromises()
    })

    //
    // Plain text
    //

    const BLOB_PLAIN_TEXT = "Oxebo"

    it("blobValue plain text", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: BLOB_PLAIN_TEXT
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(BLOB_PLAIN_TEXT)

        wrapper.unmount()
        await flushPromises()
    })

    it("blobValue plain text, base64 == true", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: BLOB_PLAIN_TEXT
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(BLOB_PLAIN_TEXT)

        wrapper.unmount()
        await flushPromises()
    })

    //
    // Base64
    //

    const BLOB_BASE64 = "T3hlYm8=" // "Oxebo" encoded with https://www.base64encode.org

    it("blobValue base64", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: BLOB_BASE64,
                base64: true
            },
        });

        await flushPromises()

        const blobMain = wrapper.get("#blob-main").text()
        expect(blobMain).toBe(BLOB_PLAIN_TEXT)
        expect(btoa(blobMain)).toBe(BLOB_BASE64)

        expect(wrapper.find("#blob-extra").exists()).toBe(false)

        wrapper.unmount()
        await flushPromises()
    })

    it("should display raw value and base64-decoded value as extra", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: BLOB_BASE64,
                base64: true,
                showBase64AsExtra: true
            },
        });

        await flushPromises()

        const blobMain = wrapper.get("#blob-main").text()
        expect(blobMain).toBe(BLOB_BASE64)

        const blobExtra = wrapper.get("#blob-extra").text()
        expect(blobExtra).toBe(BLOB_PLAIN_TEXT)
        expect(btoa(blobExtra)).toBe(BLOB_BASE64)

        wrapper.unmount()
        await flushPromises()
    })

    it("should display the (unencoded) blob value and ignore the showBase64AsExtra prop", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: BLOB_PLAIN_TEXT,
                base64: true,
                showBase64AsExtra: true
            },
        });

        await flushPromises()

        const blobMain = wrapper.get("#blob-main").text()
        expect(blobMain).toBe(BLOB_PLAIN_TEXT)

        expect(wrapper.find("#blob-extra").exists()).toBe(false)

        wrapper.unmount()
        await flushPromises()
    })

    it("blobValue invalid base64", async () => {

        const invalidBase64 = BLOB_BASE64.substring(1)

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: invalidBase64,
                base64: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(invalidBase64)

        wrapper.unmount()
        await flushPromises()
    })

    //
    // URL
    //

    const BLOB_URL = "https://hedera.com"

    it("blobValue url", async () => {

        const wrapper = mount(BlobValue, {
            global: {
                plugins: [router]
            },
            props: {
                blobValue: BLOB_URL
            },
        });

        await flushPromises()

        expect(wrapper.findComponent("a").text()).toBe(BLOB_URL)
        expect(wrapper.findComponent("a").attributes("href")).toBe(BLOB_URL)

        wrapper.unmount()
        await flushPromises()
    })


})

