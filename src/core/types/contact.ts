export interface FSABRecentContactParams {
    anchorPointContact: {
        contactId: string;
        sortField: string;
        pos: number;
    };
    relativeMoveCount: number;
    listType: number;
    count: number;
    fetchOld: boolean;
}
