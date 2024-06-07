 # Android
 ```java
            GroupMemberExtReq groupMemberExtReq = new GroupMemberExtReq();
            groupMemberExtReq.sourceType = MemberExtSourceType.TITLETYPE.ordinal();
            groupMemberExtReq.groupCode = longOrNull.longValue();
            groupMemberExtReq.beginUin = "0";
            groupMemberExtReq.dataTime = "0";
            Long[] lArr = new Long[1];
            AppInterface a2 = dVar.a();
            lArr[0] = Long.valueOf(a2 != null ? a2.getLongAccountUin() : 0L);
            arrayListOf = CollectionsKt__CollectionsKt.arrayListOf(lArr);
            groupMemberExtReq.uinList = arrayListOf;
            MemberExtInfoFilter memberExtInfoFilter = new MemberExtInfoFilter();
            memberExtInfoFilter.memberLevelInfoUin = 1;
            memberExtInfoFilter.memberLevelInfoPoint = 1;
            memberExtInfoFilter.memberLevelInfoActiveDay = 1;
            memberExtInfoFilter.memberLevelInfoLevel = 1;
            memberExtInfoFilter.levelName = 1;
            memberExtInfoFilter.dataTime = 1;
            memberExtInfoFilter.sysShowFlag = 1;
            memberExtInfoFilter.userShowFlag = 1;
            memberExtInfoFilter.userShowFlagNew = 1;
            memberExtInfoFilter.levelNameNew = 1;
            Unit unit = Unit.INSTANCE;
            groupMemberExtReq.memberExtFilter = memberExtInfoFilter;
            troopLevelFrequencyControl.f(troopUin, new TroopListRepo$fetchTroopLevelInfo$2(b2, groupMemberExtReq, troopUin, new com.tencent.qqnt.troopmemberlist.report.c("fetchTroopLevelInfo")));
```
# Win
参数解析位于 sub_181456A10(24108) -> wrapper.node(24108)+1456A10
IGroupService.GetMemberExt(param: object);
param展开如下
```
groupCode string
beginUin string
dataTime string
uinList Array<string>
uinNum string
groupType string
richCardNameVer string
sourceType number
memberExtFilter object// 参数解析位于 sub_18145A6D0(24108) -> wrapper.node(24108)+145A6D0 
```