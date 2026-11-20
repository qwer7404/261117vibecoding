import pandas as pd, re, json, math, sys
SRC=sys.argv[1]; OUT='src/data/events.json'
df=pd.read_csv(SRC,encoding='cp949',encoding_errors='replace',on_bad_lines='skip')
TODAY=pd.Timestamp('2026-11-20')
SK=(37.5463,126.9647)  # 숙명여대
def hav(la,lo):
    r=6371;p=math.pi/180
    a=math.sin((la-SK[0])*p/2)**2+math.cos(SK[0]*p)*math.cos(la*p)*math.sin((lo-SK[1])*p/2)**2
    return 2*r*math.asin(math.sqrt(a))
df['s']=pd.to_datetime(df['시작일'].astype(str).str[:10],errors='coerce')
df['e']=pd.to_datetime(df['종료일'].astype(str).str[:10],errors='coerce')
df=df[(df.e>=TODAY)&df.s.notna()&df['경도(Y좌표)'].notna()&df['위도(X좌표)'].notna()].copy()
df['lat']=pd.to_numeric(df['위도(X좌표)'],errors='coerce');df['lng']=pd.to_numeric(df['경도(Y좌표)'],errors='coerce')
df=df[df.lat.between(37.4,37.7)&df.lng.between(126.7,127.2)]
df['km']=[hav(a,b) for a,b in zip(df.lat,df.lng)]
df=df[df.km<=8].copy()
txt=lambda r:' '.join(str(r[c]) for c in ['이용대상','이용요금','기타내용','프로그램소개','공연/행사명','테마분류'] if pd.notna(r[c]))
YOUTH=re.compile(r'청소년|청년|대학생|학생\s*할인|만\s*24세|24세\s*이하|만\s*29세|29세\s*이하|청춘|유스|youth|푸른티켓|문화패스|학생증|U-?24|U-?29',re.I)
OLD=re.compile(r'만\s*(19|20|30|35|40|50|60|65)세\s*이상|성인만|어르신|영유아|유아|초등학생\s*(대상|이하)|어린이\s*(대상|전용)')
rows=[]
for _,r in df.iterrows():
    t=txt(r); free=r['유무료']=='무료'
    youth=bool(YOUTH.search(t)); 
    if OLD.search(str(r['이용대상']))and not YOUTH.search(str(r['이용대상'])): continue
    if str(r['테마분류']) in('어린이/청소년 문화행사','어르신 문화행사','가족 문화행사') and not free and not youth: continue
    if not(free or youth): continue
    km=r.km; rt=int(round((km*4.2+8)*2))  # 대중교통·도보 보정 왕복 추정
    cat=r['분류']; grp='전시' if '전시' in cat else '공연' if cat in('클래식','콘서트','연극','국악','뮤지컬/오페라','무용','독주/독창회') else '영화' if cat=='영화' else '체험·축제'
    c=lambda k:(str(r[k]).strip() if pd.notna(r[k]) else '')
    rows.append(dict(id=len(rows),title=c('공연/행사명')[:70],cat=cat,grp=grp,gu=c('자치구'),place=c('장소')[:40],
      start=r.s.strftime('%Y-%m-%d'),end=r.e.strftime('%Y-%m-%d'),time=c('행사时间' if False else '행사시간')[:40],
      fee=('무료' if free else c('이용요금')[:50]),free=bool(free),youth=youth,target=c('이용대상')[:40],
      km=round(km,1),rt=rt,lat=round(r.lat,5),lng=round(r.lng,5),
      url=(c('문화포털상세URL') or c('홈페이지?주소')),img=c('대표이미지'),culday=(c('테마분류')=='문화가 있는 날')))
rows=sorted(rows,key=lambda x:(x['km']))[:450]
for i,x in enumerate(rows): x['id']=i
json.dump(rows,open(OUT,'w'),ensure_ascii=False,separators=(',',':'))
print(len(rows),'events', sum(x['youth'] for x in rows),'youth', sum(x['free'] for x in rows),'free', sum(x['culday'] for x in rows),'culday')
import collections;print(collections.Counter(x['grp'] for x in rows)); print(collections.Counter(x['gu'] for x in rows).most_common(6))
import os;print(os.path.getsize(OUT)//1024,'KB'); print(rows[0]); print(rows[5])
