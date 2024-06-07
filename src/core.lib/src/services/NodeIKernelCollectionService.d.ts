export interface NodeIKernelCollectionService {
    addKernelCollectionListener(...args: any[]): unknown;
    removeKernelCollectionListener(...args: any[]): unknown;
    getCollectionItemList(...args: any[]): unknown;
    getCollectionContent(...args: any[]): unknown;
    getCollectionCustomGroupList(...args: any[]): unknown;
    getCollectionUserInfo(...args: any[]): unknown;
    searchCollectionItemList(...args: any[]): unknown;
    addMsgToCollection(...args: any[]): unknown;
    collectionArkShare(...args: any[]): unknown;
    collectionFileForward(...args: any[]): unknown;
    downloadCollectionFile(...args: any[]): unknown;
    downloadCollectionFileThumbPic(...args: any[]): unknown;
    downloadCollectionPic(...args: any[]): unknown;
    cancelDownloadCollectionFile(...args: any[]): unknown;
    deleteCollectionItemList(...args: any[]): unknown;
    editCollectionItem(...args: any[]): unknown;
    getEditPicInfoByPath(...args: any[]): unknown;
    collectionFastUpload(...args: any[]): unknown;
    editCollectionItemAfterFastUpload(...args: any[]): unknown;
    createNewCollectionItem(...args: any[]): unknown;
}
