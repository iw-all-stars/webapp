import { useEffect, useState } from "react";
import { Button, Flex, Icon, Menu, MenuButton, MenuItem, MenuList, MenuDivider, Text, Skeleton, Center, Box } from "@chakra-ui/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { type Restaurant } from "@prisma/client";
import { BiChevronDown } from "react-icons/bi";
import { MdAdd, MdCheck, MdSettings, MdCampaign, MdPhotoFilter, MdHome } from "react-icons/md";

export default function DashboardSidebar() {

  const router = useRouter();

  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);

  const restaurants = api.restaurant.getByOrganizationId.useQuery({
    organizationId: router.query.organizationId as string,
  });

  useEffect(() => {
    if (restaurants.data && restaurants.data[0]) {
      setCurrentRestaurant(restaurants.data[0]);
    }
  }, [restaurants.data]);

  const links = [
    {
      name: "Accueil",
      slug: "",
      icon: MdHome,
    },
    {
      name: "Stories",
      slug: "stories",
      icon: MdPhotoFilter,
    },
    {
      name: "Campagnes",
      slug: "campaigns",
      icon: MdCampaign,
    },
    {
      name: "Paramètres",
      slug: "settings",
      icon: MdSettings,
    },
  ]

  return (
    <Flex direction="column" alignItems="center" h="full" w={1/6} borderRight="1px" pt={6}>
      <Menu>
        <MenuButton as={Button} variant="unstyled">
          <Skeleton isLoaded={!!currentRestaurant}>
            <Center minW={28}>
              {currentRestaurant?.name}
              <Icon as={BiChevronDown} mt={0.5} ml={0.5} />
            </Center>
          </Skeleton>
        </MenuButton>
        <MenuList>
          {restaurants.data?.map((restaurant) => (
            <MenuItem key={restaurant.id} onClick={() => setCurrentRestaurant(restaurant)}>
              <Text>{restaurant.name}</Text>
              {currentRestaurant?.id === restaurant.id && (
                <Icon as={MdCheck} ml="auto" />
              )}
            </MenuItem>
          ))}
          <MenuDivider />
          <MenuItem>
            <Text mr={4}>Créer un nouveau restaurant</Text>
            <Icon as={MdAdd} ml="auto" />
          </MenuItem>
        </MenuList>
      </Menu>
      <Flex direction="column" alignItems="start" gap={4} mt={12}>
        {links.map(({ slug, name, icon }) => (
          <Button key={slug} w="full" justifyContent="start" variant="ghost" leftIcon={<Icon as={icon} />} onClick={() => router.push(`/dashboard/${router.query.organizationId}/${slug}`)}>
            {name}
          </Button>
        ))}
      </Flex>
    </Flex>
  )
}
