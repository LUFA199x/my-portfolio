export declare const emailService: {
    sendContactConfirmation(name: string, email: string): Promise<void>;
    sendAdminNewInquiry(data: {
        name: string;
        email: string;
        location?: string;
        message: string;
    }): Promise<void>;
    sendSubscriberWelcome(email: string, unsubToken: string): Promise<void>;
};
//# sourceMappingURL=email.d.ts.map