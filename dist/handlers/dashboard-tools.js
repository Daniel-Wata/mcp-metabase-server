/**
 * Dashboard-related tool handlers
 */
import { ErrorCode, McpError } from "../types/errors.js";
export class DashboardToolHandlers {
    client;
    constructor(client) {
        this.client = client;
    }
    getToolSchemas() {
        return [
            {
                name: "list_dashboards",
                description: "List all dashboards in Metabase",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "create_dashboard",
                description: "Create a new Metabase dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Name of the dashboard" },
                        description: {
                            type: "string",
                            description: "Optional description for the dashboard",
                        },
                        parameters: {
                            type: "array",
                            description: "Optional parameters for the dashboard",
                            items: { type: "object" },
                        },
                        collection_id: {
                            type: "number",
                            description: "Optional ID of the collection to save the dashboard in",
                        },
                    },
                    required: ["name"],
                },
            },
            {
                name: "update_dashboard",
                description: "Update an existing Metabase dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard to update",
                        },
                        name: { type: "string", description: "New name for the dashboard" },
                        description: {
                            type: "string",
                            description: "New description for the dashboard",
                        },
                        parameters: {
                            type: "array",
                            description: "New parameters for the dashboard",
                            items: { type: "object" },
                        },
                        collection_id: { type: "number", description: "New collection ID" },
                        archived: {
                            type: "boolean",
                            description: "Set to true to archive the dashboard",
                        },
                    },
                    required: ["dashboard_id"],
                },
            },
            {
                name: "delete_dashboard",
                description: "Delete a Metabase dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard to delete",
                        },
                        hard_delete: {
                            type: "boolean",
                            description: "Set to true for hard delete, false (default) for archive",
                            default: false,
                        },
                    },
                    required: ["dashboard_id"],
                },
            },
            {
                name: "get_dashboard_cards",
                description: "Get all cards in a dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                    },
                    required: ["dashboard_id"],
                },
            },
            {
                name: "add_card_to_dashboard",
                description: "Add a card to a dashboard with positioning",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                        card_id: {
                            type: "number",
                            description: "ID of the card to add",
                        },
                        row: {
                            type: "number",
                            description: "Row position (0-based)",
                            default: 0,
                        },
                        col: {
                            type: "number",
                            description: "Column position (0-based)",
                            default: 0,
                        },
                        size_x: {
                            type: "number",
                            description: "Width in grid units",
                            default: 4,
                        },
                        size_y: {
                            type: "number",
                            description: "Height in grid units",
                            default: 4,
                        },
                        parameter_mappings: {
                            type: "array",
                            description: "Parameter mappings between dashboard and card",
                            items: { type: "object" },
                        },
                        visualization_settings: {
                            type: "object",
                            description: "Visualization settings for the card on this dashboard",
                        },
                    },
                    required: ["dashboard_id", "card_id"],
                },
            },
            {
                name: "remove_card_from_dashboard",
                description: "Remove a card from a dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                        dashcard_id: {
                            type: "number",
                            description: "ID of the dashboard card (not the card itself)",
                        },
                    },
                    required: ["dashboard_id", "dashcard_id"],
                },
            },
            {
                name: "update_dashboard_card",
                description: "Update card position, size, and settings on a dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                        dashcard_id: {
                            type: "number",
                            description: "ID of the dashboard card",
                        },
                        row: {
                            type: "number",
                            description: "New row position",
                        },
                        col: {
                            type: "number",
                            description: "New column position",
                        },
                        size_x: {
                            type: "number",
                            description: "New width in grid units",
                        },
                        size_y: {
                            type: "number",
                            description: "New height in grid units",
                        },
                        parameter_mappings: {
                            type: "array",
                            description: "Updated parameter mappings",
                            items: { type: "object" },
                        },
                        visualization_settings: {
                            type: "object",
                            description: "Updated visualization settings",
                        },
                    },
                    required: ["dashboard_id", "dashcard_id"],
                },
            },
            {
                name: "set_dashboard_filters",
                description: "Add or replace filter parameters on a dashboard. These are the filter widgets that appear at the top of the dashboard (e.g., date pickers, dropdowns). Use wire_dashboard_filter_mappings to connect them to cards.",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                        filters: {
                            type: "array",
                            description: 'Array of filter parameter objects. Each needs: id (unique string), name (display label), slug (URL param name), type (e.g., "string/=" for dropdowns, "date/single" for date pickers). Add sectionId: "date" for date filters.',
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                        description: "Unique identifier for this filter (used when wiring mappings)",
                                    },
                                    name: {
                                        type: "string",
                                        description: "Display name shown on the dashboard",
                                    },
                                    slug: {
                                        type: "string",
                                        description: "URL parameter name for this filter",
                                    },
                                    type: {
                                        type: "string",
                                        description: 'Filter type: "string/=" for text/dropdown, "date/single" for single date, "date/all-options" for date range (only safe with dimension tags on non-GROUP-BY queries)',
                                    },
                                    sectionId: {
                                        type: "string",
                                        description: 'Set to "date" for date-type filters to group them in the date section',
                                    },
                                },
                                required: ["id", "name", "slug", "type"],
                            },
                        },
                    },
                    required: ["dashboard_id", "filters"],
                },
            },
            {
                name: "wire_dashboard_filter_mappings",
                description: 'Connect dashboard filters to card template tags. Each dashcard mapping specifies which filter parameters map to which template tags in the card\'s SQL. Use tag_type "variable" for text/date template tags (safe for all queries), or "dimension" for dimension-type tags (only safe on queries WITHOUT GROUP BY).',
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                        dashcard_mappings: {
                            type: "array",
                            description: "Array of dashcard mapping specs. Only include dashcards that need mappings — others are left unchanged.",
                            items: {
                                type: "object",
                                properties: {
                                    dashcard_id: {
                                        type: "number",
                                        description: "ID of the dashboard card (not the card ID — use get_dashboard_filter_info to find these)",
                                    },
                                    card_id: {
                                        type: "number",
                                        description: "ID of the underlying card/question",
                                    },
                                    mappings: {
                                        type: "array",
                                        description: "Array of individual parameter-to-tag mappings",
                                        items: {
                                            type: "object",
                                            properties: {
                                                parameter_id: {
                                                    type: "string",
                                                    description: "ID of the dashboard filter parameter (from set_dashboard_filters)",
                                                },
                                                tag: {
                                                    type: "string",
                                                    description: "Name of the template tag in the card's SQL query",
                                                },
                                                tag_type: {
                                                    type: "string",
                                                    enum: ["variable", "dimension"],
                                                    description: '"variable" for text/date tags (safe for GROUP BY queries), "dimension" for dimension tags (breaks GROUP BY — only use on scalar/CTE queries)',
                                                },
                                            },
                                            required: ["parameter_id", "tag", "tag_type"],
                                        },
                                    },
                                },
                                required: ["dashcard_id", "card_id", "mappings"],
                            },
                        },
                    },
                    required: ["dashboard_id", "dashcard_mappings"],
                },
            },
            {
                name: "get_dashboard_filter_info",
                description: "Get a compact summary of a dashboard's filter parameters and dashcard IDs with their current mappings. Use this to plan filter wiring — it returns only the fields needed for set_dashboard_filters and wire_dashboard_filter_mappings, not the full dashboard payload.",
                inputSchema: {
                    type: "object",
                    properties: {
                        dashboard_id: {
                            type: "number",
                            description: "ID of the dashboard",
                        },
                    },
                    required: ["dashboard_id"],
                },
            },
        ];
    }
    async handleTool(name, args) {
        switch (name) {
            case "list_dashboards":
                return await this.listDashboards();
            case "create_dashboard":
                return await this.createDashboard(args);
            case "update_dashboard":
                return await this.updateDashboard(args);
            case "delete_dashboard":
                return await this.deleteDashboard(args);
            case "get_dashboard_cards":
                return await this.getDashboardCards(args);
            case "add_card_to_dashboard":
                return await this.addCardToDashboard(args);
            case "remove_card_from_dashboard":
                return await this.removeCardFromDashboard(args);
            case "update_dashboard_card":
                return await this.updateDashboardCard(args);
            case "set_dashboard_filters":
                return await this.setDashboardFilters(args);
            case "wire_dashboard_filter_mappings":
                return await this.wireDashboardFilterMappings(args);
            case "get_dashboard_filter_info":
                return await this.getDashboardFilterInfo(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown dashboard tool: ${name}`);
        }
    }
    async listDashboards() {
        const dashboards = await this.client.getDashboards();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(dashboards, null, 2),
                },
            ],
        };
    }
    async createDashboard(args) {
        const { name, description, parameters, collection_id } = args;
        if (!name) {
            throw new McpError(ErrorCode.InvalidParams, "Missing required field: name");
        }
        const dashboardData = { name };
        if (description !== undefined)
            dashboardData.description = description;
        if (parameters !== undefined)
            dashboardData.parameters = parameters;
        if (collection_id !== undefined)
            dashboardData.collection_id = collection_id;
        const dashboard = await this.client.createDashboard(dashboardData);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(dashboard, null, 2),
                },
            ],
        };
    }
    async updateDashboard(args) {
        const { dashboard_id, ...updateFields } = args;
        if (!dashboard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID is required");
        }
        if (Object.keys(updateFields).length === 0) {
            throw new McpError(ErrorCode.InvalidParams, "No fields provided for update");
        }
        const dashboard = await this.client.updateDashboard(dashboard_id, updateFields);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(dashboard, null, 2),
                },
            ],
        };
    }
    async deleteDashboard(args) {
        const { dashboard_id, hard_delete = false } = args;
        if (!dashboard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID is required");
        }
        await this.client.deleteDashboard(dashboard_id, hard_delete);
        return {
            content: [
                {
                    type: "text",
                    text: hard_delete
                        ? `Dashboard ${dashboard_id} permanently deleted.`
                        : `Dashboard ${dashboard_id} archived.`,
                },
            ],
        };
    }
    async getDashboardCards(args) {
        const { dashboard_id } = args;
        if (!dashboard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID is required");
        }
        const dashboard = await this.client.getDashboard(dashboard_id);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(dashboard.dashcards || [], null, 2),
                },
            ],
        };
    }
    async addCardToDashboard(args) {
        const { dashboard_id, card_id, row = 0, col = 0, size_x = 4, size_y = 4, parameter_mappings = [], visualization_settings = {}, } = args;
        if (!dashboard_id || !card_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID and Card ID are required");
        }
        // Try different API approaches based on Metabase version
        let result;
        try {
            // Approach 1: Direct POST to dashboard cards (works in some versions)
            const dashcardData = {
                cardId: card_id,
                row,
                col,
                sizeX: size_x,
                sizeY: size_y,
                parameter_mappings,
                visualization_settings,
            };
            result = await this.client.apiCall("POST", `/api/dashboard/${dashboard_id}/cards`, dashcardData);
        }
        catch (error) {
            // Approach 2: Use PUT to update entire dashboard cards array
            try {
                const dashboard = await this.client.getDashboard(dashboard_id);
                // Create new card object for the dashboard
                const newCard = {
                    id: -1, // Temporary ID for new cards
                    card_id,
                    row,
                    col,
                    size_x,
                    size_y,
                    parameter_mappings,
                    visualization_settings,
                };
                // Add the new card to existing cards
                const updatedCards = [...(dashboard.dashcards || []), newCard];
                result = await this.client.apiCall("PUT", `/api/dashboard/${dashboard_id}/cards`, { cards: updatedCards });
            }
            catch (putError) {
                // Approach 3: Try alternative endpoint structure
                const alternativeData = {
                    card_id,
                    row,
                    col,
                    size_x,
                    size_y,
                    parameter_mappings,
                    visualization_settings,
                };
                result = await this.client.apiCall("POST", `/api/dashboard/${dashboard_id}/dashcard`, alternativeData);
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    async removeCardFromDashboard(args) {
        const { dashboard_id, dashcard_id } = args;
        if (!dashboard_id || !dashcard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID and Dashcard ID are required");
        }
        try {
            // Approach 1: Direct DELETE (standard approach)
            await this.client.apiCall("DELETE", `/api/dashboard/${dashboard_id}/cards/${dashcard_id}`);
        }
        catch (error) {
            // Approach 2: Try alternative endpoint
            try {
                await this.client.apiCall("DELETE", `/api/dashboard/${dashboard_id}/dashcard/${dashcard_id}`);
            }
            catch (altError) {
                // Approach 3: Update dashboard without the card
                const dashboard = await this.client.getDashboard(dashboard_id);
                const existingCards = dashboard.dashcards || dashboard.cards || [];
                const updatedCards = existingCards.filter((card) => card.id !== dashcard_id);
                await this.client.apiCall("PUT", `/api/dashboard/${dashboard_id}/cards`, { cards: updatedCards });
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Card with dashcard ID ${dashcard_id} removed from dashboard ${dashboard_id}`,
                },
            ],
        };
    }
    async updateDashboardCard(args) {
        const { dashboard_id, dashcard_id, ...updateFields } = args;
        if (!dashboard_id || !dashcard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID and Dashcard ID are required");
        }
        if (Object.keys(updateFields).length === 0) {
            throw new McpError(ErrorCode.InvalidParams, "No fields provided for update");
        }
        let result;
        try {
            // Approach 1: Direct PUT to specific card
            result = await this.client.apiCall("PUT", `/api/dashboard/${dashboard_id}/cards/${dashcard_id}`, updateFields);
        }
        catch (error) {
            // Approach 2: Try alternative endpoint
            try {
                result = await this.client.apiCall("PUT", `/api/dashboard/${dashboard_id}/dashcard/${dashcard_id}`, updateFields);
            }
            catch (altError) {
                // Approach 3: Update entire dashboard cards array
                const dashboard = await this.client.getDashboard(dashboard_id);
                const existingCards = dashboard.dashcards || dashboard.cards || [];
                if (existingCards.length === 0) {
                    throw new McpError(ErrorCode.InternalError, "Cannot update dashboard card: no existing cards found on dashboard. Aborting to prevent wiping all cards.");
                }
                const updatedCards = existingCards.map((card) => {
                    if (card.id === dashcard_id) {
                        return { ...card, ...updateFields };
                    }
                    return card;
                });
                result = await this.client.apiCall("PUT", `/api/dashboard/${dashboard_id}/cards`, { cards: updatedCards });
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    async setDashboardFilters(args) {
        const { dashboard_id, filters } = args;
        if (!dashboard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID is required");
        }
        if (!filters || !Array.isArray(filters) || filters.length === 0) {
            throw new McpError(ErrorCode.InvalidParams, "filters must be a non-empty array of parameter objects");
        }
        const dashboard = await this.client.updateDashboard(dashboard_id, {
            parameters: filters,
        });
        const params = dashboard.parameters || [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        status: "ok",
                        dashboard_id,
                        filters_set: params.map((p) => ({
                            id: p.id,
                            name: p.name,
                            type: p.type,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    async wireDashboardFilterMappings(args) {
        const { dashboard_id, dashcard_mappings } = args;
        if (!dashboard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID is required");
        }
        if (!dashcard_mappings ||
            !Array.isArray(dashcard_mappings) ||
            dashcard_mappings.length === 0) {
            throw new McpError(ErrorCode.InvalidParams, "dashcard_mappings must be a non-empty array");
        }
        // Get current dashboard to preserve positions for all dashcards
        const dashboard = await this.client.getDashboard(dashboard_id);
        const dashcardLookup = new Map();
        for (const dc of dashboard.dashcards || []) {
            dashcardLookup.set(dc.id, dc);
        }
        // Build mapping specs indexed by dashcard_id
        const specsByDashcard = new Map();
        for (const spec of dashcard_mappings) {
            specsByDashcard.set(spec.dashcard_id, spec);
        }
        // Build the full cards array — update specified dashcards, preserve others
        const cards = [];
        for (const dc of dashboard.dashcards || []) {
            const dcAny = dc;
            const sizeX = dcAny.size_x ?? dcAny.sizeX;
            const sizeY = dcAny.size_y ?? dcAny.sizeY;
            const spec = specsByDashcard.get(dc.id);
            if (spec) {
                const parameterMappings = spec.mappings.map((m) => ({
                    parameter_id: m.parameter_id,
                    card_id: spec.card_id,
                    target: [
                        m.tag_type === "dimension" ? "dimension" : "variable",
                        ["template-tag", m.tag],
                    ],
                }));
                cards.push({
                    id: dc.id,
                    card_id: spec.card_id,
                    row: dc.row,
                    col: dc.col,
                    size_x: sizeX,
                    size_y: sizeY,
                    parameter_mappings: parameterMappings,
                });
            }
            else {
                // Preserve existing dashcard as-is
                cards.push({
                    id: dc.id,
                    card_id: dc.card_id,
                    row: dc.row,
                    col: dc.col,
                    size_x: sizeX,
                    size_y: sizeY,
                    parameter_mappings: dcAny.parameter_mappings || [],
                });
            }
        }
        await this.client.apiCall("PUT", `/api/dashboard/${dashboard_id}/cards`, { cards });
        // Return compact summary
        const summary = cards.map((c) => ({
            dashcard_id: c.id,
            card_id: c.card_id,
            mappings_count: c.parameter_mappings.length,
            mapped_filters: c.parameter_mappings.map((m) => m.parameter_id),
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ status: "ok", dashboard_id, dashcards: summary }, null, 2),
                },
            ],
        };
    }
    async getDashboardFilterInfo(args) {
        const { dashboard_id } = args;
        if (!dashboard_id) {
            throw new McpError(ErrorCode.InvalidParams, "Dashboard ID is required");
        }
        const dashboard = await this.client.getDashboard(dashboard_id);
        const info = {
            dashboard_id,
            parameters: dashboard.parameters || [],
            dashcards: (dashboard.dashcards || []).map((dc) => ({
                dashcard_id: dc.id,
                card_id: dc.card_id,
                card_name: dc.card?.name || null,
                row: dc.row,
                col: dc.col,
                size: `${dc.size_x ?? dc.sizeX}x${dc.size_y ?? dc.sizeY}`,
                current_mappings: (dc.parameter_mappings || []).map((m) => ({
                    parameter_id: m.parameter_id,
                    target: m.target,
                })),
            })),
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(info, null, 2),
                },
            ],
        };
    }
}
