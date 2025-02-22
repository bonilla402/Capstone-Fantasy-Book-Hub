import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000/api";

/**
 * FantasyBookHubApi
 *
 * A front-end service class that handles all API interactions with the
 * Fantasy Book Hub back-end. It uses axios for HTTP requests.
 *
 * Usage:
 *   - Call static methods such as FantasyBookHubApi.login(email, password)
 *   - Each method returns data from the server or throws an error array on failure
 *
 * Authorization:
 *   - A valid JWT token is automatically included in the Authorization header if stored in localStorage.
 */
class FantasyBookHubApi {
    /**
     * A low-level request utility that all API methods call.
     *
     * @static
     * @async
     * @function request
     * @param {string} endpoint - The API endpoint (relative to BASE_URL).
     * @param {Object} [data={}] - The payload for POST/PUT/PATCH requests, or query params for GET.
     * @param {string} [method='get'] - The HTTP method (GET, POST, PATCH, DELETE, etc.).
     * @returns {Promise<Object>} The JSON response from the server.
     * @throws {string[]} An array of error messages if the request fails.
     *
     * @example
     * // Usage within the class:
     * await this.request('books', { title: 'New Book' }, 'post');
     */
    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);

        const url = `${BASE_URL}/${endpoint}`;
        const token = localStorage.getItem("token"); // Fetch fresh token each time
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const params = method === "get" ? data : {};

        try {
            const response = await axios({
                url,
                method,
                data: method !== "get" ? data : undefined,
                params,
                headers
            });
            return response.data;
        } catch (err) {
            console.error("API Error:", err.response);
            const message = err.response?.data?.error?.message || "An error occurred";
            throw Array.isArray(message) ? message : [message];
        }
    }

    // === Authentication ===

    /**
     * Logs the user in by sending { email, password } to /auth/login.
     *
     * @static
     * @async
     * @function login
     * @param {string} email - The user's email address.
     * @param {string} password - The user's password.
     * @returns {Promise<Object>} The response containing { token, user }.
     * @throws {string[]} An error array if login fails.
     */
    static async login(email, password) {
        return await this.request("auth/login", { email, password }, "post");
    }

    /**
     * Registers a new user and stores the returned token in localStorage.
     *
     * @static
     * @async
     * @function register
     * @param {string} username - Desired username.
     * @param {string} email - User's email address.
     * @param {string} password - User's password.
     * @returns {Promise<Object>} The response containing { token, user }.
     * @throws {string[]} An error array if registration fails.
     */
    static async register(username, email, password) {
        const res = await this.request("auth/register", { username, email, password }, "post");
        this.token = res.token;
        localStorage.setItem("token", this.token);
        return res; // { token, user }
    }

    /**
     * Fetches user details by email. (Currently, server route is /users/email/:email if exists)
     *
     * @static
     * @async
     * @function getUserByEmail
     * @param {string} email - The user's email to look up.
     * @returns {Promise<Object>} The user data from the server.
     */
    static async getUserByEmail(email) {
        return await this.request(`users/email/${email}`);
    }

    /**
     * Updates a user's information.
     *
     * @static
     * @async
     * @function updateUser
     * @param {number|string} userId - The ID of the user to be updated.
     * @param {Object} data - The update fields (e.g., { username, email, password }).
     * @returns {Promise<Object>} The updated user data.
     * @throws {string[]} An error array if the update fails.
     */
    static async updateUser(userId, data) {
        return await this.request(`users/${userId}`, data, "patch");
    }

    /**
     * Logs the user out by removing the token from localStorage.
     *
     * @static
     * @function logout
     * @returns {void}
     */
    static logout() {
        localStorage.removeItem("token");
    }

    // === Group Routes ===

    /**
     * Fetches all groups or searches groups, depending on optional query params.
     *
     * @static
     * @async
     * @function getGroups
     * @param {Object} [searchParams={}] - Optional search parameters.
     * @returns {Promise<Object>} The list of groups from the server.
     */
    static async getGroups(searchParams = {}) {
        return await this.request("groups", searchParams);
    }

    /**
     * Retrieves details of a single group by ID.
     *
     * @static
     * @async
     * @function getGroup
     * @param {number|string} id - The group's ID.
     * @returns {Promise<Object>} The group data.
     */
    static async getGroup(id) {
        return await this.request(`groups/${id}`);
    }

    /**
     * Performs an AND-based search for groups by various criteria (author, title, topic, etc.).
     *
     * @static
     * @async
     * @function searchGroups
     * @param {Object} [searchParams={}] - The query filters { author, title, topic, groupTitle, groupDescription }.
     * @returns {Promise<Object[]>} Array of matching groups.
     */
    static async searchGroups(searchParams = {}) {
        return await this.request("groups/search", searchParams, "get");
    }

    /**
     * Creates a new discussion group.
     *
     * @static
     * @async
     * @function createGroup
     * @param {Object} data - The group data { groupName, description }.
     * @returns {Promise<Object>} The newly created group object.
     */
    static async createGroup(data) {
        return await this.request("groups", data, "post");
    }

    /**
     * Updates an existing discussion group by ID.
     *
     * @static
     * @async
     * @function updateGroup
     * @param {number|string} groupId - The group's ID.
     * @param {Object} data - The update fields (e.g., { groupName, description }).
     * @returns {Promise<Object>} The updated group data.
     * @throws {string[]} Error array if update fails.
     */
    static async updateGroup(groupId, data) {
        try {
            return await this.request(`groups/${groupId}`, data, "PATCH");
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    }

    /**
     * Retrieves the list of members for a specific group.
     *
     * @static
     * @async
     * @function getGroupMembers
     * @param {number|string} groupId - The group's ID.
     * @returns {Promise<Object[]>} An array of users who are members of the group.
     */
    static async getGroupMembers(groupId) {
        return await this.request(`groups/${groupId}/members`);
    }

    /**
     * Adds the current user to a specified group.
     *
     * @static
     * @async
     * @function joinGroup
     * @param {number|string} groupId - The group's ID.
     * @returns {Promise<Object>} Confirmation message and membership details.
     */
    static async joinGroup(groupId) {
        return await this.request(`groups/${groupId}/join`, {}, "POST");
    }

    /**
     * Removes the current user from a specified group.
     *
     * @static
     * @async
     * @function leaveGroup
     * @param {number|string} groupId - The group's ID.
     * @returns {Promise<Object>} Confirmation message.
     */
    static async leaveGroup(groupId) {
        return await this.request(`groups/${groupId}/leave`, {}, "DELETE");
    }

    /**
     * Checks if the current user is a member of a specified group.
     *
     * @static
     * @async
     * @function isUserMember
     * @param {number|string} groupId - The group's ID.
     * @returns {Promise<Object>} An object like { isMember: boolean }.
     */
    static async isUserMember(groupId) {
        return await this.request(`groups/${groupId}/is-member`);
    }

    // === Discussion Routes ===

    /**
     * Retrieves all discussions associated with a specified group.
     *
     * @static
     * @async
     * @function getDiscussions
     * @param {number|string} groupId - The group's ID.
     * @returns {Promise<Object[]>} An array of discussions.
     */
    static async getDiscussions(groupId) {
        return await this.request(`discussions/${groupId}`);
    }

    /**
     * Creates a new discussion within a specified group.
     *
     * @static
     * @async
     * @function createDiscussion
     * @param {number|string} groupId - The group's ID.
     * @param {Object} data - The discussion data { bookId, title, content }.
     * @returns {Promise<Object>} The newly created discussion object.
     */
    static async createDiscussion(groupId, data) {
        return await this.request(`discussions/${groupId}`, data, "post");
    }

    /**
     * Retrieves details of a single discussion by ID.
     *
     * @static
     * @async
     * @function getDiscussion
     * @param {number|string} discussionId - The discussion's ID.
     * @returns {Promise<Object>} The discussion data.
     */
    static async getDiscussion(discussionId) {
        return await this.request(`discussions/detail/${discussionId}`);
    }

    // === Messages ===

    /**
     * Retrieves all messages in a specified discussion.
     *
     * @static
     * @async
     * @function getMessages
     * @param {number|string} discussionId - The discussion's ID.
     * @returns {Promise<Object[]>} An array of message objects.
     */
    static async getMessages(discussionId) {
        return await this.request(`messages/${discussionId}`);
    }

    /**
     * Adds a new message to a discussion.
     *
     * @static
     * @async
     * @function addMessage
     * @param {number|string} discussionId - The discussion's ID.
     * @param {string} content - The message text.
     * @returns {Promise<Object>} The newly created message object.
     */
    static async addMessage(discussionId, content) {
        return await this.request(`messages/${discussionId}`, { content }, "post");
    }

    // === Book Routes ===

    /**
     * Retrieves details of a specific book by ID.
     *
     * @static
     * @async
     * @function getBook
     * @param {number|string} bookId - The book's ID.
     * @returns {Promise<Object>} The book data, including authors, topics, etc.
     */
    static async getBook(bookId) {
        return await this.request(`books/${bookId}`);
    }

    /**
     * Retrieves all books with optional pagination.
     *
     * @static
     * @async
     * @function getAllBooks
     * @param {number} [page=1] - The page number for pagination.
     * @param {number} [limit=20] - The number of books per page.
     * @returns {Promise<Object>} An object containing { books: [...], totalBooks: number }.
     */
    static async getAllBooks(page = 1, limit = 20) {
        return await this.request(`books?page=${page}&limit=${limit}`);
    }

    /**
     * Dynamically searches books by a query string (title or author),
     * but must be at least 3 characters.
     *
     * @static
     * @async
     * @function searchBooksDynamic
     * @param {string} query - The search query string.
     * @returns {Promise<Object[]>} An array of matching book objects.
     */
    static async searchBooksDynamic(query) {
        try {
            const response = await axios.get(`${BASE_URL}/books/search/dynamic`, { params: { query } });
            return response.data;
        } catch (error) {
            console.error("Error fetching books:", error);
            return [];
        }
    }

    /**
     * Searches for books by title, author, or topic, with optional pagination.
     *
     * @static
     * @async
     * @function searchBooks
     * @param {Object} [filters={}] - The filter object (e.g., { title, author, topic, page, limit }).
     * @returns {Promise<Object>} An object containing { books: [...], totalBooks: number }.
     */
    static async searchBooks(filters = {}) {
        return await this.request("books/search", filters, "get");
    }

    // === Reviews Routes ===

    /**
     * Retrieves all reviews for a specific book by ID.
     *
     * @static
     * @async
     * @function getReviews
     * @param {number|string} bookId - The book's ID.
     * @returns {Promise<Object[]>} An array of review objects.
     */
    static async getReviews(bookId) {
        return await this.request(`reviews/book/${bookId}`);
    }

    /**
     * Adds a new review for a book.
     *
     * @static
     * @async
     * @function addReview
     * @param {number|string} bookId - The book's ID.
     * @param {number} rating - The star rating (1-5).
     * @param {string} [reviewText] - Optional text review.
     * @returns {Promise<Object>} The newly created review object.
     */
    static async addReview(bookId, rating, reviewText) {
        return await this.request("reviews", { bookId, rating, reviewText }, "post");
    }

    /**
     * Updates an existing review (rating and/or review text).
     *
     * @static
     * @async
     * @function updateReview
     * @param {number|string} reviewId - The review's ID.
     * @param {number} [rating] - The updated star rating (1-5).
     * @param {string} [reviewText] - The updated text review.
     * @returns {Promise<Object>} The updated review object.
     */
    static async updateReview(reviewId, rating, reviewText) {
        return await this.request(`reviews/${reviewId}`, { rating, reviewText }, "patch");
    }

    /**
     * Deletes a review by ID.
     *
     * @static
     * @async
     * @function deleteReview
     * @param {number|string} reviewId - The review's ID.
     * @returns {Promise<Object>} A confirmation message (e.g., { message: "Review deleted." }).
     */
    static async deleteReview(reviewId) {
        return await this.request(`reviews/${reviewId}`, {}, "delete");
    }
}

export default FantasyBookHubApi;
