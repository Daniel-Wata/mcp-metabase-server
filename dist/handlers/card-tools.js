/**
 * Card/Question-related tool handlers
 */
import { ErrorCode, McpError } from "../types/errors.js";
export class CardToolHandlers {
    client;
    constructor(client) {
        this.client = client;
    }
    getToolSchemas() {
        return [
            {
                name: "list_cards",
                description: "List all questions/cards in Metabase",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "create_card",
                description: "Create a new Metabase question (card)",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Name of the card" },
                        dataset_query: {
                            type: "object",
                            description: "The query for the card (e.g., MBQL or native query)",
                        },
                        display: {
                            type: "string",
                            description: "Display type (e.g., 'table', 'line', 'bar')",
                        },
                        visualization_settings: {
                            type: "object",
                            description: "Settings for the visualization",
                        },
                        collection_id: {
                            type: "number",
                            description: "Optional ID of the collection to save the card in",
                        },
                        description: {
                            type: "string",
                            description: "Optional description for the card",
                        },
                    },
                    required: [
                        "name",
                        "dataset_query",
                        "display",
                        "visualization_settings",
                    ],
                },
            },
            {
                name: "update_card",
                description: "Update an existing Metabase question (card)",
                inputSchema: {
                    type: "object",
                    properties: {
                        card_id: {
                            type: "number",
                            description: "ID of the card to update",
                        },
                        name: { type: "string", description: "New name for the card" },
                        dataset_query: {
                            type: "object",
                            description: "New query for the card",
                        },
                        display: { type: "string", description: "New display type" },
                        visualization_settings: {
                            type: "object",
                            description: "New visualization settings",
                        },
                        collection_id: { type: "number", description: "New collection ID" },
                        description: { type: "string", description: "New description" },
                        archived: {
                            type: "boolean",
                            description: "Set to true to archive the card",
                        },
                    },
                    required: ["card_id"],
                },
            },
            {
                name: "delete_card",
                description: "Delete a Metabase question (card)",
                inputSchema: {
                    type: "object",
                    properties: {
                        card_id: {
                            type: "number",
                            description: "ID of the card to delete",
                        },
                        hard_delete: {
                            type: "boolean",
                            description: "Set to true for hard delete, false (default) for archive",
                            default: false,
                        },
                    },
                    required: ["card_id"],
                },
            },
            {
                name: "get_card",
                description: "Get full details of a single Metabase question/card, including its query, display type, and visualization settings",
                inputSchema: {
                    type: "object",
                    properties: {
                        card_id: {
                            type: "number",
                            description: "ID of the card to retrieve",
                        },
                    },
                    required: ["card_id"],
                },
            },
            {
                name: "duplicate_card",
                description: "Duplicate a Metabase question/card, optionally into a different collection",
                inputSchema: {
                    type: "object",
                    properties: {
                        card_id: {
                            type: "number",
                            description: "ID of the card to duplicate",
                        },
                        collection_id: {
                            type: "number",
                            description: "Target collection ID for the copy. If omitted, copies to the same collection as the original.",
                        },
                    },
                    required: ["card_id"],
                },
            },
            {
                name: "execute_card",
                description: "Execute a Metabase question/card and get results",
                inputSchema: {
                    type: "object",
                    properties: {
                        card_id: {
                            type: "number",
                            description: "ID of the card/question to execute",
                        },
                        parameters: {
                            type: "object",
                            description: "Optional parameters for the query",
                        },
                    },
                    required: ["card_id"],
                },
            },
        ];
    }
    async handleTool(name, args) {
        switch (name) {
            case "list_cards":
                return await this.listCards();
            case "create_card":
                return await this.createCard(args);
            case "update_card":
                return await this.updateCard(args);
            case "delete_card":
                return await this.deleteCard(args);
            case "get_card":
                return await this.getCard(args);
            case "duplicate_card":
                return await this.duplicateCard(args);
            case "execute_card":
                return await this.executeCard(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown card tool: ${name}`);
        }
    }
    async listCards() {
        const cards = await this.client.getCards();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(cards, null, 2),
                },
            ],
        };
    }
    async createCard(args) {
        const { name, dataset_query, display, visualization_settings, collection_id, description, } = args;
        if (!name || !dataset_query || !display || !visualization_settings) {
            throw new McpError(ErrorCode.InvalidParams, "Missing required fields: name, dataset_query, display, visualization_settings");
        }
        const cardData = {
            name,
            dataset_query,
            display,
            visualization_settings,
        };
        if (collection_id !== undefined)
            cardData.collection_id = collection_id;
        if (description !== undefined)
            cardData.description = description;
        const card = await this.client.createCard(cardData);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(card, null, 2),
                },
            ],
        };
    }
    async updateCard(args) {
        const { card_id, ...updateFields } = args;
        if (!card_id) {
            throw new McpError(ErrorCode.InvalidParams, "Card ID is required");
        }
        if (Object.keys(updateFields).length === 0) {
            throw new McpError(ErrorCode.InvalidParams, "No fields provided for update");
        }
        const card = await this.client.updateCard(card_id, updateFields);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(card, null, 2),
                },
            ],
        };
    }
    async deleteCard(args) {
        const { card_id, hard_delete = false } = args;
        if (!card_id) {
            throw new McpError(ErrorCode.InvalidParams, "Card ID is required");
        }
        await this.client.deleteCard(card_id, hard_delete);
        return {
            content: [
                {
                    type: "text",
                    text: hard_delete
                        ? `Card ${card_id} permanently deleted.`
                        : `Card ${card_id} archived.`,
                },
            ],
        };
    }
    async getCard(args) {
        const { card_id } = args;
        if (!card_id) {
            throw new McpError(ErrorCode.InvalidParams, "Card ID is required");
        }
        const card = await this.client.getCard(card_id);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(card, null, 2),
                },
            ],
        };
    }
    async duplicateCard(args) {
        const { card_id, collection_id } = args;
        if (!card_id) {
            throw new McpError(ErrorCode.InvalidParams, "Card ID is required");
        }
        const card = await this.client.copyCard(card_id, collection_id);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(card, null, 2),
                },
            ],
        };
    }
    async executeCard(args) {
        const { card_id, parameters = {} } = args;
        if (!card_id) {
            throw new McpError(ErrorCode.InvalidParams, "Card ID is required");
        }
        const result = await this.client.executeCard(card_id, parameters);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
}
