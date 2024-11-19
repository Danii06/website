M ← 7 7 ⍴ 1 1 1 0 0 0 1 1
M[7;1] ← 0
M[1;7] ← 0
M[6;5] ← 2
M[4;3] ← 2
M[2;1] ← 2
M[2;3] ← 2
NEXT ← {(⍳7)=1⌷⍒?(⍵×10)+.×M}
NOTES ← 'CDEFGAB'
MELODY ← {⍺ ← 0 ⋄ ⍺>1000: '♫' ⋄ res ← NEXT ⍵ ⋄ ⍞ ← res/NOTES ⋄ (⍺+1) MELODY res}
MELODY 1 0 0 0 0 0 0