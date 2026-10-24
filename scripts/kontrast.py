# WCAG-Kontrast für alle Paarungen der drei Paletten
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def k(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
P={
 'A':{'grund':'#E9E9E4','flaeche':'#F6F6F2','text':'#1F2328','leise':'#4B5058','akzent':'#2B44A3','akzent-tief':'#1E3383','akzent-hell':'#DCE1F2','auf-akzent':'#F6F6F2'},
 'B':{'grund':'#F2EDEC','flaeche':'#E7DEDF','text':'#2B1A28','leise':'#5C4858','akzent':'#6C2D5C','akzent-tief':'#54214A','akzent-hell':'#EADDE6','auf-akzent':'#F7F2F1'},
 'C':{'grund':'#F4F4F1','flaeche':'#E6E6E1','text':'#1B1C1E','leise':'#4A4C51','akzent':'#F0C93A','akzent-tief':'#E0B41C','akzent-hell':'#FBF0C8','auf-akzent':'#1B1C1E'},
}
paare=[('text','grund'),('text','flaeche'),('leise','grund'),('leise','flaeche'),('auf-akzent','akzent'),('auf-akzent','akzent-tief'),('akzent','grund'),('text','akzent-hell')]
import json,sys
out={}
for n,p in P.items():
    out[n]={f'{a} auf {b}':round(k(p[a],p[b]),2) for a,b in paare}
    print(n, out[n])
if len(sys.argv)>1: json.dump({'paletten':P,'kontrast':out},open(sys.argv[1],'w'),ensure_ascii=False,indent=1)
