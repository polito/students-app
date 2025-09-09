import React from 'react';
import { PreViewPathLayer } from './PreViewPathLayer'; // Assicurati di importare i tuoi componenti
import { MarkersLayer } from './MarkersLayer';
import { isEqual } from 'lodash'; // Libreria per confronti profondi

interface MapContentProps {
    places: any[]; // Replace 'any[]' with the actual type if available
    selectedId: string; // Adjust type as needed
    setSelectedId: (id: string) => void; // Adjust type as needed
    pathFeatureCollection?: any; // Replace 'any' with the actual type if available
}

const areMapPropsEqual = (prevProps: MapContentProps, nextProps: MapContentProps) => {
    
    // 1. Confronto Profondo (Deep Comparison) per array e oggetti complessi
    // Usiamo _.isEqual per places e pathFeatureCollection
    const placesEqual = isEqual(prevProps.places, nextProps.places);
    const pathEqual = isEqual(prevProps.pathFeatureCollection, nextProps.pathFeatureCollection);

    console.log("Comparing MapContent props:");
    console.log("Places equal:", placesEqual);
    console.log("PathFeatureCollection equal:", pathEqual);

    // 2. Confronto per Riferimento (Shallow Comparison) per primitivi e funzioni
    // selectedId (probabilmente stringa/numero) e setSelectedId (funzione stabile)
    const idEqual = prevProps.selectedId === nextProps.selectedId;
    const setIDEqual = prevProps.setSelectedId === nextProps.setSelectedId; 

    console.log("SelectedId equal:", idEqual);
    console.log("SetSelectedId equal (by reference):", setIDEqual);

    // Deve ritornare TRUE se TUTTI i props sono uguali (il componente NON DEVE re-renderizzare)
    return placesEqual && pathEqual && idEqual && setIDEqual;
};

const MapContent = React.memo(({
    places,
    selectedId,
    setSelectedId,
    pathFeatureCollection,
}: MapContentProps) => {
    return (
        <>
            {
                pathFeatureCollection && (
                    <PreViewPathLayer />
                )
            }
            <MarkersLayer 
                places={places}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
            />
        </>
    );
}, areMapPropsEqual);

export default MapContent;