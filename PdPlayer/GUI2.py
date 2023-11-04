import customtkinter
from PIL import Image
import pygame
import random

customtkinter.set_appearance_mode("Dark")
customtkinter.set_default_color_theme("dark-blue")

GREEN = ["#09D509", "#00AD00"]
GRAY = ["gray", "#646464"]
RED = ["#FF4343", "#B02D2D"]

isPlaying = True

MUSIC_FILE = {
    "熱血": ["./music/example.mp3", "./music/example3.mp3"], 
    "Emo": ["./music/example2.mp3", "./music/example.mp3", "./music/example3.mp3"], 
    "電子": ["./music/example2.mp3", "./music/example.mp3", "./music/example3.mp3"],
    "放鬆": ["./music/example2.mp3", "./music/example.mp3", "./music/example3.mp3"]
}

BACKGROUND = {
    "熱血": "./background/powerbackground.jpg", 
    "Emo": "./background/emobackground.jpeg", 
    "電子": "./background/edmbackground.jpeg",
    "放鬆": "./background/relaxbackground.jpeg"
}

class PhotoFrame(customtkinter.CTkFrame):
    def __init__(self, master):
        super().__init__(master)

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)
        my_image = customtkinter.CTkImage(light_image=Image.open(BACKGROUND["放鬆"]),
                                  dark_image=Image.open(BACKGROUND["放鬆"]),
                                  size=(300, 300))
        self.image_label = customtkinter.CTkLabel(self, image=my_image, text="")
        self.image_label.grid(row=0, column=0, padx=10, pady=10, sticky="nswe", rowspan=2, columnspan=4)

class App(customtkinter.CTk):
    def __init__(self):
        super().__init__()

        self.title("Pd Player")
        self.geometry("550x400")
        self.grid_rowconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=0)
        self.grid_columnconfigure(0, weight=2)
        self.grid_columnconfigure((1,2,3), weight=0)

        self.prev_music = None
        self.music_file = None  # Update this with your file path
        pygame.mixer.init()

        self.isStarted = False
        self.isPlaying = False

        self.image = customtkinter.CTkImage(light_image=Image.open(BACKGROUND["放鬆"]),
                                            dark_image=Image.open(BACKGROUND["放鬆"]),
                                            size=(300, 300))

        self.photo_frame = PhotoFrame(self)
        self.photo_frame.grid(row=0, column=0, padx=10, pady=(10, 0), sticky="nsew", columnspan=4, rowspan=2)

        self.genre_dropdown = customtkinter.CTkOptionMenu(self, values=["Select a genre", "熱血", "Emo", "電子", "放鬆"],command=self.optionmenu_callback)
        self.genre_dropdown.set("Select a genre")
        self.genre_dropdown.grid(row=2, column=0, padx=10, pady=10, sticky="we", columnspan=2)

        self.play_button = customtkinter.CTkButton(self, text="Play", fg_color=GREEN[0], hover_color=GREEN[1], command=self.play_button_callback)
        self.play_button.grid(row=2, column=2, padx=10, pady=10, sticky="w")

        self.switch_button = customtkinter.CTkButton(self, text="Switch", fg_color=GRAY[0], hover_color=GRAY[1], command=self.switch_button_callback)
        self.switch_button.grid(row=2, column=3, padx=10, pady=10, sticky="w")


        pygame.display.init()
        screen = pygame.display.set_mode((1, 1))
        self.music_end = pygame.USEREVENT + 1
        pygame.mixer.music.set_endevent(self.music_end)
        self.mainloop_handler()

        
    def play_button_callback(self):
        if self.isStarted == False:
            print(f"Playing {self.genre_dropdown.get()}")
            self.isPlaying = True
            self.isStarted = True
            self.play_button.configure(text="Pause", fg_color=RED[0], hover_color=RED[1])
            pygame.mixer.music.load(self.music_file)
            pygame.mixer.music.play()
        else:
            if self.isPlaying == False:
                print(f"Resume playing {self.genre_dropdown.get()}")
                self.isPlaying = True
                pygame.mixer.music.unpause()
                self.play_button.configure(text="Pause", fg_color=RED[0], hover_color=RED[1])
            else:
                print("Paused.")
                self.isPlaying = False
                pygame.mixer.music.pause()
                self.play_button.configure(text="Play", fg_color=GREEN[0], hover_color=GREEN[1])

    def switch_button_callback(self):
        choice = self.genre_dropdown.get()
        available_tracks = [track for track in MUSIC_FILE[choice] if track != self.prev_music]
        self.music_file = random.choice(available_tracks)
        self.prev_music = self.music_file
        self.play_button.configure(text="Play", fg_color=GREEN[0], hover_color=GREEN[1])
        self.isPlaying = False
        self.isStarted = False
        pygame.mixer.music.stop()

    def optionmenu_callback(self, choice):
        print(f"Select Genre: {choice}")
        available_tracks = [track for track in MUSIC_FILE[choice] if track != self.prev_music]
        self.music_file = random.choice(available_tracks)
        self.prev_music = self.music_file
        self.play_button.configure(text="Play", fg_color=GREEN[0], hover_color=GREEN[1])
        self.image = customtkinter.CTkImage(light_image=Image.open(BACKGROUND[choice]), 
                                            dark_image=Image.open(BACKGROUND[choice]),
                                            size=(300, 300))
        self.photo_frame.image_label.configure(image=self.image)
        self.isPlaying = False
        self.isStarted = False
        pygame.mixer.music.stop()

    def mainloop_handler(self):
        for event in pygame.event.get():
            if event.type == self.music_end and self.isPlaying:
                print("REPEAT")
                pygame.mixer.music.play()

        self.after(100, self.mainloop_handler)

if __name__ == "__main__":
    app = App()
    app.mainloop()