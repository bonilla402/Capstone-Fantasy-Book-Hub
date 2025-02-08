import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001/api";

class FantasyBookHubApi {
    // General request function for all API calls
    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);

        const url = `${BASE_URL}/${endpoint}`;
        const token = localStorage.getItem("token"); // Fetch fresh token each time
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const params = method === "get" ? data : {};

        try {
            const response = await axios({ url, method, data, params, headers });
            return response.data;
        } catch (err) {
            console.error("API Error:", err.response);
            const message = err.response?.data?.error?.message || "An error occurred";
            throw Array.isArray(message) ? message : [message];
        }
    }

    // === Authentication ===
    static async login(email, password) {
        return await this.request("auth/login", {email, password}, "post");
    }

    static async register(username, email, password) {
        const res = await this.request("auth/register", { username, email, password }, "post");
        this.token = res.token;
        localStorage.setItem("token", this.token);
        return res; // ✅ Now returns { token, user }
    }

    // Fetch user details by email
    static async getUserByEmail(email) {
        return await this.request(`users/email/${email}`);
    }

    // Update user details
    static async updateUser(userId, data) {
        return await this.request(`users/${userId}`, data, "patch");
    }

    static logout() {
        localStorage.removeItem("token");
    }

    // === Group Routes ===
    static async getGroups(searchParams = {}) {
        return await this.request("groups", searchParams);
    }

    static async getGroup(id) {
        return await this.request(`groups/${id}`);
    }

    static async createGroup(data) {
        return await this.request("groups", data, "post");
    }

    static async joinGroup(groupId) {
        return await this.request(`groups/${groupId}/join`, {}, "post");
    }

    // === Discussion Routes ===
    static async getDiscussions(groupId) {
        return await this.request(`groups/${groupId}/discussions`);
    }

    static async createDiscussion(groupId, data) {
        return await this.request(`groups/${groupId}/discussions`, data, "post");
    }

    static async getDiscussion(discussionId) {
        return await this.request(`discussions/${discussionId}`);
    }

    // === Messages ===
    static async getMessages(discussionId) {
        return await this.request(`discussions/${discussionId}/messages`);
    }

    static async addMessage(discussionId, data) {
        return await this.request(`discussions/${discussionId}/messages`, data, "post");
    }
}

export default FantasyBookHubApi;
