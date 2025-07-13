const gameAssets = {
    // 맵 데이터
    dungeonMap: {
        width: 25,
        height: 19,
        tilewidth: 32,
        tileheight: 32,
        layers: [
            {
                name: "바닥",
                data: Array(25 * 19).fill(1)
            },
            {
                name: "벽",
                data: Array(25 * 19).fill(0).map((_, i) => {
                    const x = i % 25;
                    const y = Math.floor(i / 25);
                    return (x === 0 || x === 24 || y === 0 || y === 18) ? 2 : 0;
                }),
                properties: [{ name: "collides", value: true }]
            }
        ]
    }
}; 