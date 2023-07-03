export function getParamFromPathName(
    pathName: string,
    key: string
): string | undefined {
    const pathNameArray = pathName.split("/");
    const index = pathNameArray.indexOf(key);
    return pathNameArray[index + 1];
}
