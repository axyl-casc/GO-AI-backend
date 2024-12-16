const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function generateTsumego(rank, type){
    let rank_number = convertKyuDanToLevel(rank)
    let beginner = convertKyuDanToLevel("30k");
    let intermediate = convertKyuDanToLevel("20k");
    let advanced = convertKyuDanToLevel("10k");

    let possible_tsumego = []

    possible_tsumego.push(`(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]VW[ao:sg]
        RU[Japanese]SZ[19]KM[0.00]
        PW[White]PB[Black]AW[qa][qb][qc][qd][qe][re][se]AB[ra][rb][rc][rd][sd]
        (;B[sb]LB[sa:1][sc:2]C[Very Good! Now black has two eyes, marked by 1 and 2. ]TE[1])
        (;B[sa]
        (;W[sb]SQ[sb][sc]C[Incorrect, keep playing to see why. Black only has space to create 1 eye now. ]
        ;B[sc]
        ;W[sb])
        (;W[sc]
        ;B[sb]
        ;W[sc]))
        (;B[sc]
        (;W[sb]SQ[sa][sb]C[Incorrect, keep playing to see why. Black only has space to create 1 eye now. ]
        ;B[sa]
        ;W[sb])
        (;W[sa]
        ;B[sb]
        ;W[sa])))`);

        return getRandomElement(possible_tsumego)
}

module.exports = { generateTsumego };