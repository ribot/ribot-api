Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "forwarded_port", guest: 4568, host: 4568

  config.vm.synced_folder "./", "/home/vagrant/app"

  # Allow for symlinks in the app folder. This will not work on
  # Windows, and will not work with Vagrant providers other than VirtualBox
  config.vm.provider "virtualbox" do |vb|
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/app", "1"]
  end

  config.vm.provision :chef_solo do |chef|
    chef.add_recipe "nodejs"

    chef.json = {
      "nodejs" => {
        "version" => "0.10.26"
      }
    }
  end
end
