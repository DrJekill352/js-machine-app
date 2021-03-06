import { useContext, createContext } from 'react';
import { Event } from '@js-machine-app/models';
import { observable, action, runInAction } from 'mobx';

import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
  } from '@js-machine-app/data-service';

export class EventStore {
    @observable public events!: Event[]

    public constructor() {
        this.init();
      }
    
      @action public init = () => {
        this.events = [];
      };

    @action public loadEvents = async () => {
        if (!this.events.length) {
          const events = await getEvents();
          runInAction(() => (this.events = events));
        }
    };
      
  @action public createEvent = async (event: Event) => {
    try {
      const { id } = await createEvent(event);
      runInAction(() => {
        event.id = id;
        this.events.push(event);
      });
    } catch (err) {
      console.error(err);
    }
  };

  @action public saveEvent = async (event: Event) => {
    try {
      await updateEvent(event);
      runInAction(() => {
        this.events = this.events.map(d => (d.id === event.id ? event : d));
      });
    } catch (err) {
      console.error(err);
    }
  };

  @action public deleteEvent = async (event: Event) => {
    try {
      await deleteEvent(event.id);
      runInAction(
        () => (this.events = this.events.filter(e => e.id !== event.id)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  public findEventById = async (id: string) => {
    if (!this.events.length) {
      await this.loadEvents();
    }

    return this.events.find(e => e.id === id);
  };
}

const StoreContext = createContext(new EventStore());
export const useEventStore = () => useContext(StoreContext);