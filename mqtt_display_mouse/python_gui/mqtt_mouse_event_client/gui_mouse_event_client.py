"""
Ryan Haas
Dr. David Tarnoff
CSCI 4677-901, IoT
9 October, 2020

I'm not going to comment this; consider my Node dashboard
the requirement. This is just a little bonus.
"""

import paho.mqtt.client as mqtt
from config import mqtt_config
from tkinter import *
from PIL import Image, ImageTk
from threading import Thread
from time import sleep

WINDOW = Tk()

left_click_label  = None
right_click_label = None
x_left_label      = None
x_right_label     = None
y_down_label      = None
y_up_label        = None
wheel_click_label = None
scroll_up_label   = None
scroll_down_label = None


def left_click():
    left_click_label.place(x=250, y=215)
    sleep(.01)
    left_click_label.place_forget()


def right_click():
    right_click_label.place(x=315, y=215)
    sleep(.01)
    right_click_label.place_forget()


def wheel_click():
    wheel_click_label.place(x=282, y=220)
    sleep(.01)
    wheel_click_label.place_forget()


def x_left():
    x_left_label.place(x=100, y=220)
    sleep(.02)
    x_left_label.place_forget()


def x_right():
    x_right_label.place(x=420, y=220)
    sleep(.02)
    x_right_label.place_forget()


def y_down():
    y_down_label.place(x=280, y=450)
    sleep(.02)
    y_down_label.place_forget()


def y_up():
    y_up_label.place(x=280, y=80)
    sleep(.02)
    y_up_label.place_forget()


def scroll_up():
    scroll_up_label.place(x=282, y=220)
    sleep(.02)
    scroll_up_label.place_forget()


def scroll_down():
    scroll_down_label.place(x=282, y=220)
    sleep(.02)
    scroll_down_label.place_forget()


def on_subscribe(client, userdata, mid, granted_qos):
    print('\n[MQTT Client] Subscribed: ' + str(mid) + ' ' + str(granted_qos))


def on_message(client, userdata, msg):
    click = int(msg.payload[0])
    x_val = int(msg.payload[1])
    y_val = int(msg.payload[2])
    scroll = int(msg.payload[3])

    sum = 0
    if (x_val < 200):
        if(x_val == 0):
            print('No X movement')
        else:
            x_right()
            print('Mouse right')
    else:
        x_left()
        print('Mouse left')

    if (y_val < 200):
        if (y_val == 0):
            print('No Y movement')
        else:
            y_down()
            print('Mouse down')
    else:
        y_up()
        print('Mouse up')

    if (click == 0):
        print('No click')
    else:
        if (click == 1):
            left_click()
            print('Left click')
        elif (click == 2):
            right_click()
            print('Right click')
        else:
            wheel_click()
            print('Wheel click')

    if (scroll == 0):
        print('No scroll')
    else:
        if (scroll == 1):
            scroll_up()
            print('Scroll up')
        else:
            scroll_down()

    print('\nMOUSE INPUT: ')
    print(msg.payload)
    print()


def init_window():
    global left_click_label
    global right_click_label
    global wheel_click_label
    global x_left_label
    global x_right_label
    global y_down_label
    global y_up_label
    global scroll_up_label
    global scroll_down_label

    WINDOW.title('MQTT Mouse Input Dashboard')
    WINDOW.minsize(600, 600)

    mouse_bg_image = ImageTk.PhotoImage(
        Image.open('images/mouse.png')
    )
    action_image = ImageTk.PhotoImage(
        Image.open('images/action.png')
    )
    x_left_image = ImageTk.PhotoImage(
        Image.open('images/mouse-left.png')
    )
    x_right_image = ImageTk.PhotoImage(
        Image.open('images/mouse-right.png')
    )
    y_down_image = ImageTk.PhotoImage(
        Image.open('images/mouse-down.png')
    )
    y_up_image = ImageTk.PhotoImage(
        Image.open('images/mouse-up.png')
    )
    y_up_image = ImageTk.PhotoImage(
        Image.open('images/mouse-up.png')
    )
    x_right_image = ImageTk.PhotoImage(
        Image.open('images/mouse-right.png')
    )
    scroll_up_image = ImageTk.PhotoImage(
        Image.open('images/scroll-up.png')
    )
    scroll_down_image = ImageTk.PhotoImage(
        Image.open('images/scroll-down.png')
    )

    bg_label = Label(
        WINDOW, 
        image=mouse_bg_image          
    )
    left_click_label = Label(
        WINDOW,
        image=action_image,
        borderwidth=0
    )
    right_click_label = Label(
        WINDOW,
        image=action_image,
        borderwidth=0
    )
    wheel_click_label = Label(
        WINDOW,
        image=action_image,
        borderwidth=0
    )
    x_left_label = Label(
        WINDOW,
        image=x_left_image,
        borderwidth=0
    )
    x_right_label = Label(
        WINDOW,
        image=x_right_image,
        borderwidth=0
    )
    y_down_label = Label(
        WINDOW,
        image=y_down_image,
        borderwidth=0
    )
    y_up_label = Label(
        WINDOW,
        image=y_up_image,
        borderwidth=0
    )
    scroll_up_label = Label(
        WINDOW,
        image=scroll_up_image,
        borderwidth=0
    )
    scroll_down_label = Label(
        WINDOW,
        image=scroll_down_image,
        borderwidth=0
    )
    bg_label.place(x=0, y=0, relwidth=1, relheight=1)

    WINDOW.mainloop()


def init_client():
    client = mqtt.Client()
    client.username_pw_set(mqtt_config.CONFIG['username'],
                        mqtt_config.CONFIG['password'])
    client.on_subscribe = on_subscribe
    client.on_message = on_message
    client.connect(host=mqtt_config.CONFIG['host'], 
                    port=mqtt_config.CONFIG['port'])
    print('\n[MQTT Client] Connected to broker.\n')

    client.subscribe('pub/mouseinput', qos=0)

    t = Thread(target=client.loop_forever)
    t.start()


init_client()
init_window()
scroll_up()
