document.addEventListener('DOMContentLoaded', () => {
    var tsumego = new WGo.Tsumego(document.getElementById("tsumego_wrapper"), {
        sgf: `(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]VW[ao:sg]
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
        ;W[sa])))`,
        debug: false, /* Set to false to hide solution */
        answerDelay: 500,
        displayHintButton: false
    });
    
    
    // Enable coordinates display
    tsumego.setCoordinates(true);

});

