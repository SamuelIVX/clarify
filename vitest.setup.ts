import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

class LocalStorageMock {
    private store = new Map<string, string>();

    get length() {
        return this.store.size;
    }

    clear() {
        this.store.clear();
    }

    getItem(key: string) {
        return this.store.has(key) ? this.store.get(key)! : null;
    }

    setItem(key: string, value: string) {
        this.store.set(key, String(value));
    }

    removeItem(key: string) {
        this.store.delete(key);
    }

    key(index: number) {
        return Array.from(this.store.keys())[index] ?? null;
    }
}

vi.stubGlobal("localStorage", new LocalStorageMock());

afterEach(() => {
    cleanup();
    localStorage.clear();
});
