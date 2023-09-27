import { useDispatch, useSelector } from 'react-redux'
import { onAddNewEvent, onDeleteEvent, onSetActiveEvent, onUpdateEvent, onLoadEvents } from '../store/calendar/calendarSlice';
import { calendarApi } from '../api';
import { convertEventsToDate } from '../helpers';
import Swal from 'sweetalert2';

export const useCalendarStore = () => {

  const dispatch = useDispatch();
  const {events, activeEvent} = useSelector(state => state.calendar);
  const { user } = useSelector( state => state.auth );

  const setActiveEvent = ( calendarEvent ) => {
    dispatch( onSetActiveEvent( calendarEvent ) )
  }

  const startSavingEvent = async( calendarEvent ) => {

   try {
      if( calendarEvent.id ) {
         await calendarApi.put(`/events/${ calendarEvent.id }`, calendarEvent)
         dispatch( onUpdateEvent({...calendarEvent, user}));
         return;
     } 
      const { data } = await calendarApi.post('events', calendarEvent);
      dispatch(onAddNewEvent({ ...calendarEvent, id: data.evento.id, user }));
   } catch (error) {
      Swal.fire('Error al guardar', error.response.data.msg, ' error')
   }
     
  }

  const startDeleteEvent = async() => {

   try {
         await calendarApi.delete(`/events/${ activeEvent.id }`)
         dispatch( onDeleteEvent(activeEvent));
   } catch (error) {
      Swal.fire('Error al borrar', error.response.data.msg, ' error')
   }
  }

  const startLoadingEvents = async ( ) => {
      try {
         
         const { data } = await calendarApi.get('/events');
         const events = convertEventsToDate( data.eventos.filter( evento => evento.user._id === user.uid) );
         dispatch( onLoadEvents( events ) )
      } catch (error) {
         console.log(error)
      }
  }

  return {
        events,
        activeEvent,
        hasEventSelected: !!activeEvent,
        setActiveEvent,
        startSavingEvent,
        startDeleteEvent,
        startLoadingEvents
  }
}
