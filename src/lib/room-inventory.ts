
export const roomInventory: { [key: string]: number } = {
    'double': 6,
    'single-standard': 4,
    'single-deluxe': 7,
    'deluxe': 7,
    'double-balcony': 8,
    'apartment': 2,
    'triple': 3,
};

export const totalRooms = Object.values(roomInventory).reduce((acc, count) => acc + count, 0);
