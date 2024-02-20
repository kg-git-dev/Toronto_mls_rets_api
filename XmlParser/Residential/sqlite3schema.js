const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('../Data/Residential/residentialDatabase.db');

db.run('PRAGMA foreign_keys=off;');

db.run('BEGIN TRANSACTION;');

db.run(`
  CREATE TABLE IF NOT EXISTS residentialDatabase (
    MLS TEXT PRIMARY KEY,
    PhotoCount,
    PhotoLink JSON,
    SearchAddress,
    AccessToProperty1,
    AccessToProperty2,
    Acreage,
    AddlMonthlyFees,
    Address,
    AirConditioning,
    AllInclusive INTEGER DEFAULT 0,
    ApproxAge,
    ApproxSquareFootage,
    AptUnit,
    Area,
    AreaCode,
    Assessment,
    AssessmentYear,
    Assignment INTEGER DEFAULT 0,
    Basement1,
    Basement2,
    Bedrooms,
    BedroomsPlus,
    CableTVIncluded INTEGER DEFAULT 0,
    CacIncluded INTEGER DEFAULT 0,
    CentralVac INTEGER DEFAULT 0,
    CommonElementsIncluded INTEGER DEFAULT 0,
    Community,
    CommunityCode,
    DirectionsCrossStreets,
    DisplayAddressOnInternet INTEGER DEFAULT 0,
    Drive,
    EasementsRestrictions1,
    EasementsRestrictions2,
    EasementsRestrictions3,
    EasementsRestrictions4,
    Elevator INTEGER DEFAULT 0,
    Exterior1,
    Exterior2,
    Extras,
    FamilyRoom INTEGER DEFAULT 0,
    FarmAgriculture,
    FireplaceStove INTEGER DEFAULT 0,
    FractionalOwnership INTEGER DEFAULT 0,
    FrontingOnNSEW INTEGER DEFAULT 0,
    Furnished INTEGER DEFAULT 0,
    GarageSpaces,
    GarageType,
    HeatIncluded INTEGER DEFAULT 0,
    HeatSource,
    HeatType,
    HydroIncluded INTEGER DEFAULT 0,
    IdxUpdtedDt,
    Kitchens,
    KitchensPlus,
    LaundryAccess,
    LaundryLevel,
    LeasedTerms,
    LegalDescription,
    Level1,
    Level10,
    Level11,
    Level12,
    Level2,
    Level3,
    Level4,
    Level5,
    Level6,
    Level7,
    Level8,
    Level9,
    Link INTEGER DEFAULT 0,
    LinkComment,
    ListBrokerage,
    ListPrice,
    MaxListPrice,
    MinListPrice,
    LotDepth,
    LotFront,
    LotIrregularities,
    LotSizeCode,
    Map,
    MapColumn,
    MapRow,
    Municipality,
    MunicipalityDistrict,
    MunicipalityCode,
    OtherStructures1,
    OtherStructures2,
    OutofAreaMunicipality,
    ParcelOfTiedLand INTEGER DEFAULT 0,
    ParkCostMo,
    ParkingIncluded INTEGER DEFAULT 0,
    ParkingSpaces,
    ParcelId,
    PixUpdtedDt,
    Pool,
    PortionLeaseComments,
    PortionPropertyLease1,
    PortionPropertyLease2,
    PortionPropertyLease3,
    PortionPropertyLease4,
    PortionPropertyLeaseSrch,
    PossessionRemarks,
    PostalCode,
    PrivateEntrance INTEGER DEFAULT 0,
    PropertyFeatures1,
    PropertyFeatures2,
    PropertyFeatures3,
    PropertyFeatures4,
    PropertyFeatures5,
    PropertyFeatures6,
    Province,
    RemarksForClients,
    Retirement INTEGER DEFAULT 0,
    Room1,
    Room1Desc1,
    Room1Desc2,
    Room1Desc3,
    Room1Length,
    Room1Width,
    Room10,
    Room10Desc1,
    Room10Desc2,
    Room10Desc3,
    Room10Length,
    Room10Width,
    Room11,
    Room11Desc1,
    Room11Desc2,
    Room11Desc3,
    Room11Length,
    Room11Width,
    Room12,
    Room12Desc1,
    Room12Desc2,
    Room12Desc3,
    Room12Length,
    Room12Width,
    Room2,
    Room2Desc1,
    Room2Desc2,
    Room2Desc3,
    Room2Length,
    Room2Width,
    Room3,
    Room3Desc1,
    Room3Desc2,
    Room3Desc3,
    Room3Length,
    Room3Width,
    Room4,
    Room4Desc1,
    Room4Desc2,
    Room4Desc3,
    Room4Length,
    Room4Width,
    Room5,
    Room5Desc1,
    Room5Desc2,
    Room5Desc3,
    Room5Length,
    Room5Width,
    Room6,
    Room6Desc1,
    Room6Desc2,
    Room6Desc3,
    Room6Length,
    Room6Width,
    Room7,
    Room7Desc1,
    Room7Desc2,
    Room7Desc3,
    Room7Length,
    Room7Width,
    Room8,
    Room8Desc1,
    Room8Desc2,
    Room8Desc3,
    Room8Length,
    Room8Width,
    Room9,
    Room9Desc1,
    Room9Desc2,
    Room9Desc3,
    Room9Length,
    Room9Width,
    Rooms,
    RoomsPlus,
    RuralServices1,
    RuralServices2,
    RuralServices3,
    RuralServices4,
    RuralServices5,
    SaleLease,
    AlternativePower1,
    AlternativePower2,
    SellerPropertyInfoStatement INTEGER DEFAULT 0,
    Sewage2,
    Sewers,
    ShorelineAllowance,
    ShorelineExposure INTEGER DEFAULT 0,
    Shoreline1,
    Shoreline2,
    SpecialDesignation1,
    SpecialDesignation2,
    SpecialDesignation3,
    SpecialDesignation4,
    SpecialDesignation5,
    SpecialDesignation6,
    Status,
    Street,
    StreetAbbreviation,
    StreetDirection INTEGER DEFAULT 0,
    StreetName,
    Style,
    TaxYear,
    Taxes,
    TotalParkingSpaces,
    TypeOwnSrch,
    TypeOwn1Out,
    Uffi,
    TimestampSql,
    UtilitiesCable INTEGER DEFAULT 0,
    UtilitiesGas INTEGER DEFAULT 0,
    UtilitiesHydro INTEGER DEFAULT 0,
    UtilitiesTelephone INTEGER DEFAULT 0,
    VirtualTourUploadDate,
    VirtualTourURL,
    Washrooms,
    WashroomsType1,
    WashroomsType1Pcs,
    WashroomsType1Level,
    WashroomsType2,
    WashroomsType2Pcs,
    WashroomsType2Level,
    WashroomsType3,
    WashroomsType3Pcs,
    WashroomsType3Level,
    WashroomsType4,
    WashroomsType4Pcs,
    WashroomsType4Level,
    WashroomsType5,
    WashroomsType5Pcs,
    WashroomsType5Level,
    Water,
    WaterBodyName,
    WaterBodyType,
    WaterDeliveryFeatures1,
    WaterFeatures1,
    WaterFeatures2,
    WaterFeatures3,
    WaterFeatures4,
    WaterFeatures5,
    WaterFrontage,
    WaterIncluded INTEGER DEFAULT 0,
    WaterSupplyTypes,
    Waterfront,
    WaterfrontAccBldgs1,
    WaterfrontAccBldgs2,
    Zoning INTEGER DEFAULT 0
  )
`);
db.run('COMMIT;', () => {
  db.close();
});