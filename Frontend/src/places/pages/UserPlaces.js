import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { useHttpClient } from '../../shared/hooks/http-hook'
import PlaceList from '../components/PlaceList'

const UserPlaces = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient()
    const [loadedPlaces, setLoadedPlaces] = useState()
    const userId = useParams().userId

    const placeDeletedHandler = (deletedPlaceId) => {
        setLoadedPlaces((prevPlaces) =>
            prevPlaces.filter((place) => place.id !== deletedPlaceId)
        )
    }

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/places/user/${userId}`
                )
                setLoadedPlaces(responseData.places)
            } catch (err) {}
        }
        fetchPlaces()
    }, [sendRequest, userId])

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedPlaces && (
                <PlaceList
                    items={loadedPlaces}
                    onDeletePlaces={placeDeletedHandler}
                />
            )}
        </React.Fragment>
    )
}
export default UserPlaces;
