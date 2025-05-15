import { ElementHandle } from "playwright";

export class WebScraper {
    // Function to safely extract text content
    async safeGetText(article: ElementHandle, selector: string): Promise<string | null> {
        try {
            return await article.$eval(selector, el => (el as HTMLElement).textContent?.trim() || null);
        } catch {
            return null; // If not found, return null
        }
    }

    // Function to safely extract an array of text contents
    async safeGetArrayText(article: ElementHandle, selector: string): Promise<string[]> {
        try {
            return await article.$$eval(selector, els => els.map(el => el.textContent?.trim() || ''));
        } catch {
            return [];
        }
    }

    // Function to safely extract an attribute (e.g., href)
    async safeGetAttribute(article: ElementHandle, selector: string, attr: string): Promise<string | null> {
        try {
            // console.log("here in safe attribute", selector, attr)
            const element = await article.$(selector);

            if (!element) {
                // console.log("Element not found for selector:", selector);
                return null;
            }

            // Get the attribute
            const attribute = await element.getAttribute(attr);
            // console.log(`Extracted attribute (${attr}):`, attribute);

            return attribute;
        } catch (error) {
            return null;
        }
    }
}