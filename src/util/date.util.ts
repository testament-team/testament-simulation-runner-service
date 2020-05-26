export function dateTimeReviver(key: string, value: string) {
    if(key === "date") {
        return new Date(value);
    }
    return value;
}