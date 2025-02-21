﻿import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000/api";

class FantasyBookHubApi {
    // General request function for all API calls
    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);

        const url = `${BASE_URL}/${endpoint}`;
        const token = localStorage.getItem("token"); // Fetch fresh token each time
        const headers = token ? {Authorization: `Bearer ${token}`} : {};
        const params = method === "get" ? data : {};

        try {
            const response = await axios({url, method, data: method !== "get" ? data : undefined, params, headers});
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
        const res = await this.request("auth/register", {username, email, password}, "post");
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

    static async searchGroups(searchParams = {}) {
        return await this.request("groups/search", searchParams, "get");
    }

    static async createGroup(data) {
        return await this.request("groups", data, "post");
    }

    static async updateGroup(groupId, data) {
        try {
            return await this.request(`groups/${groupId}`, data, "PATCH");
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    }

    static async getGroupMembers(groupId) {
        return await this.request(`groups/${groupId}/members`);
    }

    static async joinGroup(groupId) {
        return await this.request(`groups/${groupId}/join`, {}, "POST");
    }

    static async leaveGroup(groupId) {
        return await this.request(`groups/${groupId}/leave`, {}, "DELETE");
    }

    static async isUserMember(groupId) {
        return await this.request(`groups/${groupId}/is-member`);
    }

    // === Discussion Routes ===

    static async getDiscussions(groupId) {
        return await this.request(`discussions/${groupId}`);
    }

    static async createDiscussion(groupId, data) {
        return await this.request(`discussions/${groupId}`, data, "post");
    }

    static async getDiscussion(discussionId) {
        return await this.request(`discussions/detail/${discussionId}`);
    }

    // === Messages ===
    static async getMessages(discussionId) {
        return await this.request(`messages/${discussionId}`);
    }

    static async addMessage(discussionId, content) {
        return await this.request(`messages/${discussionId}`, {content}, "post");
    }


    // === Book Routes ===
    static async getBook(bookId) {
        return await this.request(`books/${bookId}`);
    }

    static async getAllBooks(page = 1, limit = 20) {
        return await this.request(`books?page=${page}&limit=${limit}`);
    }

    static async searchBooksDynamic(query) {
        try {
            const response = await axios.get(`${BASE_URL}/books/search/dynamic`, {params: {query}});
            return response.data;
        } catch (error) {
            console.error("Error fetching books:", error);
            return [];
        }
    }

    static async searchBooks(filters = {}) {
        return await this.request("books/search", filters, "get");
    }

    // === Reviews Routes ===

    // Get all reviews for a book
    static async getReviews(bookId) {
        return await this.request(`reviews/book/${bookId}`);
    }

    // Add a new review
    static async addReview(bookId, rating, reviewText) {
        return await this.request("reviews", { bookId, rating, reviewText }, "post");
    }

    // Update an existing review
    static async updateReview(reviewId, rating, reviewText) {
        return await this.request(`reviews/${reviewId}`, { rating, reviewText }, "patch");
    }

    // Delete a review
    static async deleteReview(reviewId) {
        return await this.request(`reviews/${reviewId}`, {}, "delete");
    }
}

export default FantasyBookHubApi;
